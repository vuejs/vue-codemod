#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import Module from 'module'

import * as yargs from 'yargs'
import * as globby from 'globby'
import * as util from 'util'

import createDebug from 'debug'
import { question } from 'readline-sync'

import builtInTransformations from '../transformations'
import { excludedTransformations } from '../transformations'
import vueTransformations from '../vue-transformations'
import { excludedVueTransformations } from '../vue-transformations'
import runTransformation from '../src/runTransformation'
import { transform as packageTransform } from '../src/packageTransformation'

import type { TransformationModule } from '../src/runTransformation'

const debug = createDebug('vue-codemod')
const log = console.log.bind(console)
let processFilePath: string[] = []

const {
  _: files,
  transformation: transformationName,
  runAllTransformation: runAllTransformation,
  params
} = yargs
  .usage('Usage: $0 [file pattern]')
  .option('transformation', {
    alias: 't',
    type: 'string',
    conflicts: 'runAllTransformation',
    describe: 'Name or path of the transformation module'
  })
  .option('params', {
    alias: 'p',
    describe: 'Custom params to the transformation'
  })
  .option('runAllTransformation', {
    alias: 'a',
    type: 'boolean',
    conflicts: 'transformation',
    describe: 'run all transformation module'
  })
  .example([
    [
      'npx vue-codemod ./src -a',
      'Run all rules to convert all relevant files in the ./src folder'
    ],
    [
      'npx vue-codemod ./src/components/HelloWorld.vue -t slot-attribute',
      'Run slot-attribute rule to convert HelloWorld.vue'
    ]
  ])
  .help()
  .alias('h', 'help').argv

// TODO: port the `Runner` interface of jscodeshift
async function main() {
  // Remind user to back up files
  const answer = question(
    'Warning!!\n ' +
      'This tool may overwrite files.\n' +
      'Enter yes to continue:'
  )
  if (answer.trim() !== 'yes') {
    return
  }

  const resolvedPaths = globby.sync(files as string[])
  if (transformationName != undefined) {
    const transformationModule = loadTransformationModule(transformationName)
    processTransformation(
      resolvedPaths,
      transformationName,
      transformationModule
    )
    packageTransform()
  }

  if (runAllTransformation) {
    for (let key in builtInTransformations) {
      if (!excludedTransformations.includes(key)) {
        processTransformation(resolvedPaths, key, builtInTransformations[key])
      }
    }

    for (let key in vueTransformations) {
      if (!excludedVueTransformations.includes(key)) {
        processTransformation(resolvedPaths, key, vueTransformations[key])
      }
    }
    packageTransform()
  }
  const processFilePathList = processFilePath.join('\n')
  console.log(`--------------------------------------------------`)
  console.log(`Processed file:\n${processFilePathList}`)
  console.log(`Processed ${processFilePath.length} files`)
}
/**
 * process files by Transformation
 * @param resolvedPaths resolved file path
 * @param transformationName transformation name
 * @param transformationModule transformation module
 */
function processTransformation(
  resolvedPaths: string[],
  transformationName: string,
  transformationModule: TransformationModule
) {
  log(`Processing use ${transformationName} transformation`)

  const extensions = ['.js', '.ts', '.vue', '.jsx', '.tsx']
  for (const p of resolvedPaths) {
    debug(`Processing ${p}…`)
    const fileInfo = {
      path: p,
      source: fs.readFileSync(p).toString()
    }
    const extension = (/\.([^.]*)$/.exec(fileInfo.path) || [])[0]
    if (!extensions.includes(extension)) {
      continue
    }
    try {
      debug(`Processing file: ${fileInfo.path}`)
      const result = runTransformation(
        fileInfo,
        transformationModule,
        params as object
      )
      fs.writeFileSync(p, result)
      if (util.inspect(processFilePath).indexOf(util.inspect(p)) == -1) {
        processFilePath.push(p)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
/**
 * load Transformation Module
 * @param nameOrPath
 * @returns
 */
function loadTransformationModule(nameOrPath: string) {
  let jsTransformation = builtInTransformations[nameOrPath]
  let vueTransformation = vueTransformations[nameOrPath]
  if (jsTransformation) {
    return jsTransformation
  }
  if (vueTransformation) {
    return vueTransformation
  }

  const customModulePath = path.resolve(process.cwd(), nameOrPath)
  if (fs.existsSync(customModulePath)) {
    const requireFunc = Module.createRequire(
      path.resolve(process.cwd(), './package.json')
    )
    // TODO: interop with ES module
    // TODO: fix absolute path
    return requireFunc(`./${nameOrPath}`)
  }

  throw new Error(`Cannot find transformation module ${nameOrPath}`)
}
