import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

export const transformAST: ASTTransformation = ({ root, j }) => {
//  find the export default
  const defaultExportBody = root.find(j.ExportDefaultDeclaration)

//  find the CallExpression
  const emitCalls = defaultExportBody.find(j.CallExpression, node => {
    return node.callee.object?.type === 'ThisExpression'
      && node.callee.property?.name === '$emit'
  })

  if (emitCalls.length) {
    //  find the $emit argument
    const eventNames: string[] = []
    emitCalls.forEach(({ node }) => {
      if (node.arguments[0]?.type === 'StringLiteral') {
        eventNames.push(node.arguments[0].value)
      }
    })

    //  find the emit property
    const emitsProperty = defaultExportBody.find(j.ObjectProperty, node => {
      return node.key.name === 'emits'
        && node.value.type === 'ArrayExpression'
    })

    const elements = emitsProperty.length ? emitsProperty.get(0).node.value.elements : []
    const emits = elements.map((r: { value: string }) => r.value)
    const hasEmitsProperty = emitsProperty.length

    // push not declare event name into emits
    eventNames.forEach(r => {
      if (!emits.includes(r)) {
        elements.push(j.stringLiteral(r))
      }
    })

    if(!hasEmitsProperty){
    //  no emits property then create emits:[...]  AST
      defaultExportBody.get(0).node.declaration.properties.unshift(j.objectProperty(j.identifier('emits'),j.arrayExpression(elements)));
    }
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
