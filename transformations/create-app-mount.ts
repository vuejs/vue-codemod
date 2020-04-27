import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

import type * as N from 'jscodeshift'

import { transformAST as addImport } from './add-import'

type Params = {
  // if false, do not take expressions like `new HelloWorld().$mount` or
  // `new HelloWorld({ el: '#app' })`into account
  includeMaybeComponents?: boolean
}

// Limitations: cannot transform expressions like `vm = new Vue(); vm.$mount('#app')`
export const transformAST: ASTTransformation<Params | void> = (
  context,
  params: Params = {
    includeMaybeComponents: true,
  }
) => {
  const { j, root } = context
  const { includeMaybeComponents = true } = params

  let mountCalls = root.find(j.CallExpression, (n: N.CallExpression) => {
    return (
      j.MemberExpression.check(n.callee) &&
      j.NewExpression.check(n.callee.object) &&
      j.Identifier.check(n.callee.property) &&
      n.callee.property.name === '$mount'
    )
  })

  if (!includeMaybeComponents) {
    mountCalls = mountCalls.filter((path) => {
      const instance = (path.node.callee as N.MemberExpression).object
      const ctor = (instance as N.NewExpression).callee
      return j.Identifier.check(ctor) && ctor.name === 'Vue'
    })
  }

  if (mountCalls.length) {
    addImport(context, {
      specifier: {
        type: 'named',
        imported: 'createApp',
      },
      source: 'vue',
    })

    mountCalls.replaceWith(({ node }) => {
      const el = node.arguments[0]

      const instance = (node.callee as N.MemberExpression)
        .object as N.NewExpression

      const ctor = instance.callee
      if (j.Identifier.check(ctor) && ctor.name === 'Vue') {
        const rootProps = instance.arguments[0]

        return j.callExpression(
          j.memberExpression(
            j.callExpression(j.identifier('createApp'), [rootProps]),
            j.identifier('mount')
          ),
          [el]
        )
      } else {
        return j.callExpression(
          j.memberExpression(
            j.callExpression(j.identifier('createApp'), [
              ctor,
              ...instance.arguments, // additional props
            ]),
            j.identifier('mount')
          ),
          [el]
        )
      }
    })
  }

  let newWithEl = root.find(j.NewExpression, (n: N.NewExpression) => {
    return (
      n.arguments.length === 1 &&
      j.ObjectExpression.check(n.arguments[0]) &&
      n.arguments[0].properties.some(
        (prop) =>
          j.ObjectProperty.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name === 'el'
      )
    )
  })

  if (!includeMaybeComponents) {
    newWithEl = newWithEl.filter((path) => {
      const ctor = path.node.callee
      return j.Identifier.check(ctor) && ctor.name === 'Vue'
    })
  }

  if (newWithEl.length) {
    addImport(context, {
      specifier: {
        type: 'named',
        imported: 'createApp',
      },
      source: 'vue',
    })

    newWithEl.replaceWith(({ node }) => {
      const rootProps = node.arguments[0] as N.ObjectExpression
      const elIndex = rootProps.properties.findIndex(
        (p) =>
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
      if (j.Identifier.check(ctor) && ctor.name === 'Vue') {
        return j.callExpression(
          j.memberExpression(
            j.callExpression(j.identifier('createApp'), [rootProps]),
            j.identifier('mount')
          ),
          // @ts-ignore I'm not sure what the edge cases are
          [elExpr]
        )
      } else {
        return j.callExpression(
          j.memberExpression(
            j.callExpression(j.identifier('createApp'), [
              ctor,
              // additional props, and skip empty objects
              ...(rootProps.properties.length > 0 ? [rootProps] : []),
            ]),
            j.identifier('mount')
          ),
          // @ts-ignore I'm not sure what the edge cases are
          [elExpr]
        )
      }
    })

    // new MyComponent({ el: '#app' })
    // 1. split `el` value and other props
    // 2. contruct new expressions
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
