import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

/**
 * It is expected to be run after the `createApp` transformataion
 * if a root component is trivial, that is, it contains only one simple prop,
 * like `{ render: h => h(App) }`, then just use the `App` variable
 *
 * TODO: implement `remove-trivial-render`,
 * move all other rootProps to the second argument of `createApp`
 */
export const transformAST: ASTTransformation = ({ root, j }) => {
  const appRoots = root.find(j.CallExpression, {
    callee: { name: 'createApp' },
    // @ts-ignore
    arguments: (args) =>
      args.length === 1 && args[0].type === 'ObjectExpression',
  })
  appRoots.forEach(({ node: createAppCall }) => {
    if (!j.ObjectExpression.check(createAppCall.arguments[0])) {
      return
    }

    const { properties } = createAppCall.arguments[0]
    if (properties.length !== 1) {
      return
    }
    const prop = properties[0]
    if (j.SpreadProperty.check(prop) || j.SpreadElement.check(prop)) {
      return
    }

    if (
      prop.key &&
      j.Identifier.check(prop.key) &&
      prop.key.name === 'render'
    ) {
      let renderFnBody
      if (j.ObjectMethod.check(prop)) {
        renderFnBody = prop.body
      } else if (j.ArrowFunctionExpression.check(prop.value)) {
        renderFnBody = prop.value.body
      } else {
        return
      }

      let callExpr
      if (j.CallExpression.check(renderFnBody)) {
        callExpr = renderFnBody
      } else if (
        j.BlockStatement.check(renderFnBody) &&
        renderFnBody.body.length === 1 &&
        j.ReturnStatement.check(renderFnBody.body[0]) &&
        j.CallExpression.check(renderFnBody.body[0].argument)
      ) {
        callExpr = renderFnBody.body[0].argument
      }

      if (
        callExpr &&
        j.Identifier.check(callExpr.callee) &&
        callExpr.callee.name === 'h' &&
        callExpr.arguments.length === 1
      ) {
        const rootComponent = callExpr.arguments[0]
        createAppCall.arguments[0] = rootComponent
      }
    }
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
