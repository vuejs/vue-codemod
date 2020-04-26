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
export const transformAST: ASTTransformation<Params> = (
  context,
  { includeMaybeComponents = true }: Params = {}
) => {
  const { j, root } = context

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

  // TODO: new MyComponent({ el: '#app' })
}

export default wrap(transformAST)
export const parser = 'babylon'
