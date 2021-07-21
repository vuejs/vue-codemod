import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

export const transformAST: ASTTransformation = ({ root, j }) => {
  // find the Vue.nextTick(...)
  const nextTickCalls = root.find(j.CallExpression, n => {
    return (
      n.callee.type === 'MemberExpression' &&
      n.callee.property.name === 'nextTick' &&
      n.callee.object.name === 'Vue'
    )
  })

  if (nextTickCalls.length) {
    // add import nextTick
    const addImport = require('./add-import')
    addImport.transformAST({ root, j }, {
      specifier: {
        type: 'named',
        imported: 'nextTick'
      },
      source: 'vue'
    })

    nextTickCalls.replaceWith(({ node }) => {
      const el = node.arguments[0]
      return j.callExpression(j.identifier('nextTick'), [el])
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
