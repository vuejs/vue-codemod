/**
 * Remove `Vue.use()` calls
 * Per current design, `Vue.use` is replaced by `app.use`.
 * But in library implementations like `vue-router` and `vuex`,
 * the new `app.use` does not reuse the same argument passed to `Vue.use()`,
 * but expects instantiated instances that are used to pass to the root components instead.
 * So we now expect the migration to be done in the `root-prop-to-use` transformation,
 * and the `Vue.use` statements can be just abandoned.
 */
import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'
import { transformAST as removeExtraneousImport } from './remove-extraneous-import'

export const transformAST: ASTTransformation = (context) => {
  const { j, root } = context
  const vueUseCalls = root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        name: 'Vue',
      },
      property: {
        name: 'use',
      },
    },
  })

  const pluginNames: string[] = []
  vueUseCalls.forEach(({ node }) => {
    if (j.Identifier.check(node.arguments[0])) {
      pluginNames.push(node.arguments[0].name)
    }
  })

  vueUseCalls.remove()

  pluginNames.forEach((name) =>
    removeExtraneousImport(context, {
      localBinding: name,
    })
  )
}

export default wrap(transformAST)
export const parser = 'babylon'
