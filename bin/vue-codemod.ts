#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import Module from 'module'

import * as yargs from 'yargs'
import * as globby from 'globby'

import createDebug from 'debug'

import builtInTransformations from '../transformations'
import vueTransformations from '../vue-transformations'
import runTransformation from '../src/runTransformation'

import type { TransformationModule } from '../src/runTransformation'

const debug = createDebug('vue-codemod')
const log = console.log.bind(console)

const {
  _: files,
  transformation: transformationName,
  runAllTransformation: runAllTransformation,
  params,
} = yargs
  .usage('Usage: $0 [file pattern]')
  .option('transformation', {
    alias: 't',
    type: 'string',
    conflicts: 'runAllTransformation',
    describe: 'Name or path of the transformation module',
  })
  .option('params', {
    alias: 'p',
    describe: 'Custom params to the transformation',
  })
  .option('runAllTransformation', {
    alias: 'a',
    type: 'boolean',
    conflicts: 'transformation',
    describe: 'run all transformation module',
  })
  .example([
    [
      'npx vue-codemod ./src -a',
      'Run all rules to convert all relevant files in the ./src folder',
    ],
    [
      'npx vue-codemod ./src/components/HelloWorld.vue -t slot-attribute',
      'Run slot-attribute rule to convert HelloWorld.vue',
    ],
  ])
  .help().argv

// TODO: port the `Runner` interface of jscodeshift
async function main() {
  const resolvedPaths = globby.sync(files as string[])
  if (transformationName != undefined) {
    const transformationModule = loadTransformationModule(transformationName)
    processTransformation(
      resolvedPaths,
      transformationName,
      transformationModule
    )
  }

  if (runAllTransformation) {
    for (let key in builtInTransformations) {
      processTransformation(resolvedPaths, key, builtInTransformations[key])
    }

    for (let key in vueTransformations) {
      processTransformation(resolvedPaths, key, vueTransformations[key])
    }
  }
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
  log(
    `Processing ${resolvedPaths.length} files… use ${transformationName} transformation`
  )

  const extensions = ['.js', '.ts', '.vue', '.jsx', '.tsx']
  for (const p of resolvedPaths) {
    debug(`Processing ${p}…`)
    const fileInfo = {
      path: p,
      source: fs.readFileSync(p).toString(),
    }
    const extension = (/\.([^.]*)$/.exec(fileInfo.path) || [])[0]
    if (!extensions.includes(extension)) {
      continue
    }
    try {
      const result = runTransformation(
        fileInfo,
        transformationModule,
        params as object
      )
      fs.writeFileSync(p, result)
    } catch (e) {
      console.error(e)
    }
  }
}

main().catch((err) => {
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
