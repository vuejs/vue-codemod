import { Node } from 'vue-eslint-parser/ast/nodes'
import * as OperationUtils from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'
import type { VueASTTransformation } from '../src/wrapVueTransformation'
import * as parser from 'vue-eslint-parser'
import wrap from '../src/wrapVueTransformation'

export const transformAST: VueASTTransformation = (context) => {
  var fixOperations: Operation[] = []
  const toFixNodes: Node[] = findNodes(context)
  toFixNodes.forEach((node) => {
    fixOperations = fixOperations.concat(fix(node))
  })
  return fixOperations
}

export default wrap(transformAST)
/**
 * search slot attribute nodes
 *
 * @param context
 * @param templateBody
 * @returns slot attribute nodes
 */
function findNodes(context: any): Node[] {
  const { file } = context
  const source = file.source
  const options = { sourceType: 'module' }
  const ast = parser.parse(source, options)
  var toFixNodes: Node[] = []
  var root: Node = <Node>ast.templateBody
  parser.AST.traverseNodes(root, {
    enterNode(node: Node) {
      if (node.type === 'VAttribute' && node.key.name === 'slot') {
        toFixNodes.push(node)
      }
    },
    leaveNode(node: Node) {},
  })
  return toFixNodes
}
/**
 * fix logic
 * @param fixer
 * @param slotAttr
 */
function fix(node: Node): Operation[] {
  var fixOperations: Operation[] = []

  const target: any = node!.parent!.parent
  // @ts-ignore
  const slotValue: string = node!.value!.value

  // remove v-slot:${slotValue}
  fixOperations.push(OperationUtils.remove(node))
  // add <template v-slot:${slotValue}>
  fixOperations.push(
    OperationUtils.insertTextBefore(target, `<template v-slot:${slotValue}>`)
  )
  // add </template>
  fixOperations.push(OperationUtils.insertTextAfter(target, `</template>`))

  return fixOperations
}
