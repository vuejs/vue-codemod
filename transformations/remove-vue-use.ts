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

export const transformAST: ASTTransformation = ({ j, root }) => {
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
  vueUseCalls.remove()
}

export default wrap(transformAST)
export const parser = 'babylon'
