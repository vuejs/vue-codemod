import { Node } from 'vue-eslint-parser/ast/nodes'
import * as OperationUtils from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'
import type { VueASTTransformation } from '../src/wrapVueTransformation'
import * as parser from 'vue-eslint-parser'
import wrap from '../src/wrapVueTransformation'

export const transformAST: VueASTTransformation = context => {
  let fixOperations: Operation[] = []
  const { file } = context
  const source = file.source
  const toFixNodes: Node[] = findNodes(source)
  toFixNodes.forEach(node => {
    fixOperations = fixOperations.concat(fix(node, source))
  })
  return fixOperations
}

export default wrap(transformAST)

function findNodes(source: string): Node[] {
  const options = { sourceType: 'module' }
  const ast = parser.parse(source, options)
  let toFixNodes: Node[] = []
  let root: Node = <Node>ast.templateBody
  parser.AST.traverseNodes(root, {
    enterNode(node: Node) {
      if (
        node.type === 'VAttribute' &&
        node.directive &&
        node.key.name.name === 'for' &&
        node.parent.attributes.length > 1
      ) {
        for (let ifNode of node.parent.attributes) {
          // @ts-ignore
          if (ifNode?.key?.name?.name === 'if') toFixNodes.push(node)
        }
      }
    },
    leaveNode(node: Node) {}
  })
  return toFixNodes
}

function fix(node: Node, source: string): Operation[] {
  let fixOperations: Operation[] = []
  const target: any = node!.parent
  let forValue: string = source.slice(node.range[0], node.range[1])
  let keyNode: any = false
  for (let findKeyNode of target?.attributes) {
    // @ts-ignore
    if (findKeyNode?.key?.argument?.name === 'key') keyNode = findKeyNode
  }
  if (keyNode) {
    let keyValue: string = source.slice(keyNode.range[0], keyNode.range[1])
    forValue += ' ' + keyValue
    fixOperations.push(OperationUtils.remove(keyNode))
  }
  fixOperations.push(OperationUtils.remove(node))
  fixOperations.push(
    OperationUtils.insertTextBefore(target!.parent, `<template ${forValue}>\n`)
  )
  fixOperations.push(
    OperationUtils.insertTextAfter(target!.parent, `\n</template>`)
  )
  return fixOperations
}
