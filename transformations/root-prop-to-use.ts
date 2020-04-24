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
  const appRoots = root.find(j.CallExpression, {
    callee: { name: 'createApp' },
    arguments: (args: N.ASTNode[]) =>
      args.length === 1 &&
      j.ObjectExpression.check(args[0]) &&
      // @ts-ignore
      args[0].properties.find((p) => p.key && p.key.name === rootPropName),
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
      j.memberExpression(
        j.callExpression(j.identifier('createApp'), [rootProps]),
        j.identifier('use')
      ),
      [pluginInstance]
    )
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
