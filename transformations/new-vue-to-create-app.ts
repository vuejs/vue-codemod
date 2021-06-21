import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import type * as N from 'jscodeshift'

type Params = {
  // if false, do not take expressions like `new HelloWorld().$mount` or
  // `new HelloWorld({ el: '#app' })`into account
  includeMaybeComponents?: boolean
}

// Limitations: cannot transform expressions like `new HelloWorld()`
// FIXME: for ES modules, should use `createApp` instead of `Vue.createApp`
// because the latter makes it difficult to tree-shake the vue module
// FIXME: need to ensure there will be a Vue import if needed.
export const transformAST: ASTTransformation<Params | void> = (
  context,
  params: Params = {
    includeMaybeComponents: true
  }
) => {
  const { j, root } = context
  const { includeMaybeComponents = true } = params

  const newVue = root.find(j.NewExpression, {
    callee: {
      type: 'Identifier',
      name: 'Vue'
    }
  })

  // new Vue() -> Vue.createApp()
  newVue.replaceWith(({ node }) => {
    const rootProps = node.arguments
    return j.callExpression(
      j.memberExpression(j.identifier('Vue'), j.identifier('createApp')),
      rootProps
    )
  })

  const vueCreateApp = newVue
  // Vue.createApp().$mount() -> Vue.createApp().mount()
  vueCreateApp.forEach(path => {
    const parentNode = path.parent.node
    if (
      j.MemberExpression.check(parentNode) &&
      parentNode.object === path.node &&
      j.Identifier.check(parentNode.property) &&
      parentNode.property.name === '$mount'
    ) {
      parentNode.property.name = 'mount'
    }
  })

  // Vue.createApp({ el: '#app' }) -> Vue.createApp().mount('#app')
  vueCreateApp.replaceWith(({ node }) => {
    if (
      node.arguments.length !== 1 ||
      !j.ObjectExpression.check(node.arguments[0])
    ) {
      return node
    }

    const rootProps = node.arguments[0]
    const elIndex = rootProps.properties.findIndex(
      p =>
        j.ObjectProperty.check(p) &&
        j.Identifier.check(p.key) &&
        p.key.name === 'el'
    )

    if (elIndex === -1) {
      return node
    }

    const elProperty = rootProps.properties.splice(
      elIndex,
      1
    )[0] as N.ObjectProperty
    const elExpr = elProperty.value
    return j.callExpression(
      j.memberExpression(node, j.identifier('mount')),
      // @ts-ignore I'm not sure what the edge cases are
      [elExpr]
    )
  })

  if (includeMaybeComponents) {
    // new My().$mount
    const new$mount = root.find(j.CallExpression, (n: N.CallExpression) => {
      return (
        j.MemberExpression.check(n.callee) &&
        j.NewExpression.check(n.callee.object) &&
        j.Identifier.check(n.callee.property) &&
        n.callee.property.name === '$mount'
      )
    })
    new$mount.replaceWith(({ node }) => {
      const el = node.arguments[0]

      const instance = (node.callee as N.MemberExpression)
        .object as N.NewExpression
      const ctor = instance.callee

      return j.callExpression(
        j.memberExpression(
          j.callExpression(
            j.memberExpression(j.identifier('Vue'), j.identifier('createApp')),
            [
              ctor,
              ...instance.arguments // additional props
            ]
          ),
          j.identifier('mount')
        ),
        [el]
      )
    })

    // vm.$mount
    const $mount = root.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: {
          type: 'Identifier',
          name: '$mount'
        }
      },
      arguments: (args: Array<any>) => args.length === 1
    })
    $mount.forEach(({ node }) => {
      // @ts-ignore
      node.callee.property.name = 'mount'
    })

    // new My({ el })
    const newWithEl = root.find(j.NewExpression, (n: N.NewExpression) => {
      return (
        n.arguments.length === 1 &&
        j.ObjectExpression.check(n.arguments[0]) &&
        n.arguments[0].properties.some(
          prop =>
            j.ObjectProperty.check(prop) &&
            j.Identifier.check(prop.key) &&
            prop.key.name === 'el'
        )
      )
    })

    newWithEl.replaceWith(({ node }) => {
      const rootProps = node.arguments[0] as N.ObjectExpression
      const elIndex = rootProps.properties.findIndex(
        p =>
          j.ObjectProperty.check(p) &&
          j.Identifier.check(p.key) &&
          p.key.name === 'el'
      )
      const elProperty = rootProps.properties.splice(
        elIndex,
        1
      )[0] as N.ObjectProperty
      const elExpr = elProperty.value

      const ctor = node.callee
      return j.callExpression(
        j.memberExpression(
          j.callExpression(
            j.memberExpression(j.identifier('Vue'), j.identifier('createApp')),
            [
              ctor,
              // additional props, and skip empty objects
              ...(rootProps.properties.length > 0 ? [rootProps] : [])
            ]
          ),
          j.identifier('mount')
        ),
        // @ts-ignore I'm not sure what the edge cases are
        [elExpr]
      )
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
