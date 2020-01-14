#!/usr/bin/env node

import program from 'commander'
import execa from 'execa'

import * as fs from 'fs'
import * as path from 'path'

import { version } from '../package.json'

program
  .name('vue-codemod')
  .version(version)
  
  .requiredOption('-t, --transformation <name>', 'Name or path of a transfromation module')
  .requiredOption('-f, --file <glob>', 'Files or directory to run codemod on')
  .option('--dry', 'Dry run (no changes are made to files)')
  
  .parse(process.argv)

function resolveTransformation (name: string) {  
  const builtInPath = require.resolve(`../transforms/${name}`)
  if (fs.existsSync(builtInPath)) {
    return builtInPath
  }
  
  const customModulePath = path.resolve(process.cwd(), name)
  if (fs.existsSync(customModulePath)) {
    return customModulePath
  }
}

const transformationPath = resolveTransformation(program.transformation)
if (!transformationPath) {
  console.error(`Cannot find transformation module ${program.transformation}`)
  process.exit(1)
}

// TODO:
// don't depend on the jscodeshift **CLI** interface
// so that we can apply the adapter to all code transforms directly
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift')
execa.sync(jscodeshiftExecutable, ['-t', transformationPath, program.file, '--extensions', 'vue,js'], {
  stdio: 'inherit',
  stripFinalNewline: false
})
