import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

import * as N from 'jscodeshift'

type Params = {
  rootPropName: string
}

/**
 * Expected to be run after the `createApp` transformation.
 * Transforms expressions like `createApp({ router })` to `createApp().use(router)`
 */
export const transformAST: ASTTransformation<Params> = (
  { root, j },
  { rootPropName }
) => {
  const appRoots = root.find(j.CallExpression, (node: N.CallExpression) => {
    if (
      node.arguments.length === 1 &&
      j.ObjectExpression.check(node.arguments[0])
    ) {
      if (j.Identifier.check(node.callee) && node.callee.name === 'createApp') {
        return true
      }

      if (
        j.MemberExpression.check(node.callee) &&
        j.Identifier.check(node.callee.object) &&
        node.callee.object.name === 'Vue' &&
        j.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'createApp'
      ) {
        return true
      }
    }
  })

  appRoots.replaceWith(({ node: createAppCall }) => {
    const rootProps = createAppCall.arguments[0] as N.ObjectExpression
    const propertyIndex = rootProps.properties.findIndex(
      // @ts-ignore
      (p) => p.key && p.key.name === rootPropName
    )
    // @ts-ignore
    const [{ value: pluginInstance }] = rootProps.properties.splice(
      propertyIndex,
      1
    )

    return j.callExpression(
      j.memberExpression(createAppCall, j.identifier('use')),
      [pluginInstance]
    )
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
