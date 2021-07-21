import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

export const transformAST: ASTTransformation = ({ root, j }) => {
  // find the Vue.observable(state)
  const observableCalls = root.find(j.CallExpression, n => {
    return (
      n.callee.type === 'MemberExpression' &&
      n.callee.property.name === 'observable' &&
      n.callee.object.name === 'Vue'
    )
  })

  if (observableCalls.length) {
    // add import reactive
    const addImport = require('./add-import')
    addImport.transformAST({ root, j }, {
      specifier: {
        type: 'named',
        imported: 'reactive'
      },
      source: 'vue'
    })

    observableCalls.replaceWith(({ node }) => {
      const el = node.arguments[0]
      return j.callExpression(j.identifier('reactive'), [el])
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
