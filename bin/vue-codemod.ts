#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import Module from 'module'

import * as yargs from 'yargs'
import * as globby from 'globby'

import createDebug from 'debug'

import builtInTransformations from '../transformations'
import runTransformation from '../src/run-transformation'

const debug = createDebug('vue-codemod')
const log = console.log.bind(console)

const { _: files, transformation: transformationName, params } = yargs
  .usage('Usage: $0 [file pattern]')
  .option('transformation', {
    alias: 't',
    type: 'string',
    describe: 'Name or path of the transformation module',
  })
  .option('params', {
    alias: 'p',
    describe: 'Custom params to the transformation',
  })
  .demandOption('transformation')
  .help().argv

// TODO: port the `Runner` interface of jscodeshift
async function main() {
  const resolvedPaths = globby.sync(files)
  const transformation = loadTransformation(transformationName)

  log(`Processing ${resolvedPaths.length} files…`)

  for (const p of resolvedPaths) {
    debug(`Processing ${p}…`)
    const fileInfo = {
      path: p,
      source: fs.readFileSync(p).toString(),
    }
    try {
      const result = runTransformation(
        fileInfo,
        transformation,
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

function loadTransformation(nameOrPath: string) {
  let transformation = builtInTransformations[nameOrPath]
  if (transformation) {
    return transformation
  }

  const customModulePath = path.resolve(process.cwd(), nameOrPath)
  if (fs.existsSync(customModulePath)) {
    const requireFunc = Module.createRequire(
      path.resolve(process.cwd(), './package.json')
    )
    // TODO: interop with ES module
    // TODO: fix absolute path
    const module = requireFunc(`./${nameOrPath}`)
    const transformation =
      typeof module.default === 'function' ? module.default : module
    return transformation
  }

  throw new Error(`Cannot find transformation module ${nameOrPath}`)
}
