import * as fs from 'fs'
import * as globby from 'globby'
import * as prettier from 'prettier'
import createDebug from 'debug'

const debug = createDebug('vue-codemod:rule')

/**
 * Creates a fix command that inserts text at the specified index in the source text.
 * @param {int} index The 0-based index at which to insert the new text.
 * @param {string} text The text to insert.
 * @returns {Object} The fix command.
 * @private
 */
export function transform(): boolean {
  debug('Find package.json.')
  const resolvedPaths = globby.sync('package.json' as string)
  if (resolvedPaths.length <= 0) {
    console.warn('package.json is not exists.')
    return false
  }

  let packageObject: any = JSON.parse(
    fs.readFileSync(resolvedPaths[0]).toString()
  )

  if (packageObject?.dependencies != undefined) {
    debug('Process dependencies')
    process(packageObject.dependencies)
  }

  if (packageObject?.peerDependencies != undefined) {
    debug('Process peerDependencies')
    process(packageObject.peerDependencies)
  }

  if (packageObject?.devDependencies != undefined) {
    debug('Process devDependencies')
    process(packageObject.devDependencies)
  }

  if (packageObject?.devDependencies != undefined) {
    packageObject.devDependencies['@vue/compiler-sfc'] = '^3.1.1'
    packageObject.devDependencies['eslint'] = '^7.20.0'
    packageObject.devDependencies['eslint-plugin-vue'] = '^7.11.1'
  }

  let formatted = prettier.format(
    JSON.stringify(packageObject),
    Object.assign({ parser: 'json' }, packageObject.prettier)
  )
  fs.writeFileSync(resolvedPaths[0], formatted)
  return true
}
/**
 * Modify the configuration of dependencies
 * @param dependencies
 */
function process(dependencies: any) {
  if (dependencies['vue'] != undefined) {
    dependencies.vue = '^3.1.1'
  }
  if (dependencies['vuex'] != undefined) {
    dependencies['vuex'] = '^4.0.1'
  }
  if (dependencies['vue-router'] != undefined) {
    dependencies['vue-router'] = '^4.0.8'
  }
  if (dependencies['vue-i18n'] != undefined) {
    dependencies['vue-i18n'] = '^9.1.6'
  }
  if (dependencies['vue-template-compiler'] != undefined) {
    delete dependencies['vue-template-compiler']
  }
  if (dependencies['@vue/composition-api'] != undefined) {
    delete dependencies['@vue/composition-api']
  }
}
