import * as fs from 'fs'
import * as globby from 'globby'
import * as prettier from 'prettier'

/**
 * Creates a fix command that inserts text at the specified index in the source text.
 * @param {int} index The 0-based index at which to insert the new text.
 * @param {string} text The text to insert.
 * @returns {Object} The fix command.
 * @private
 */
export function transform(): void {
  const resolvedPaths = globby.sync('package.json' as string)
  if (resolvedPaths.length <= 0) {
    return
  }

  let packageObject: any = JSON.parse(
    fs.readFileSync(resolvedPaths[0]).toString()
  )

  if (packageObject!.dependencies!.vue != undefined) {
    packageObject.dependencies.vue = '^3.1.1'
  }
  if (packageObject!.dependencies!.vuex != undefined) {
    packageObject.dependencies!.vuex = '^4.0.1'
  }
  if (packageObject!.dependencies['vue-router'] != undefined) {
    packageObject.dependencies['vue-router'] = '^4.0.8'
  }
  if (packageObject!.dependencies['vue-i18n'] != undefined) {
    packageObject.dependencies['vue-i18n'] = '^9.1.6'
  }

  if ((packageObject!.devDependencies['vue-template-compiler'] = undefined)) {
    delete packageObject.devDependencies['vue-template-compiler']
  }

  packageObject.devDependencies['@vue/compiler-sfc'] = '^3.1.1'
  packageObject.devDependencies['eslint'] = '^7.20.0'
  packageObject.devDependencies['eslint-plugin-vue'] = '^7.11.1'

  let formatted = prettier.format(
    JSON.stringify(packageObject),
    Object.assign({ parser: 'json' }, packageObject.prettier)
  )
  fs.writeFileSync(resolvedPaths[0], formatted)
}
