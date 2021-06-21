import { Node } from 'vue-eslint-parser/ast/nodes'
import * as OperationUtils from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'
import type { VueASTTransformation } from '../src/wrapVueTransformation'
import * as parser from 'vue-eslint-parser'
import wrap from '../src/wrapVueTransformation'

export const transformAST: VueASTTransformation = context => {
  let fixOperations: Operation[] = []
  const toFixNodes: Node[] = findNodes(context)
  toFixNodes.forEach(node => {
    fixOperations = fixOperations.concat(fix(node))
  })
  return fixOperations
}

export default wrap(transformAST)

function findNodes(context: any): Node[] {
  const { file } = context
  const source = file.source
  const options = { sourceType: 'module' }
  const ast = parser.parse(source, options)
  let toFixNodes: Node[] = []
  let root: Node = <Node>ast.templateBody
  parser.AST.traverseNodes(root, {
    enterNode(node: Node) {
      if (
        node.type === 'VAttribute' &&
        node.key.type === 'VDirectiveKey' &&
        node.key.name.name === 'on' &&
        node.value?.type === 'VExpressionContainer' &&
        node.value.expression?.type === 'Identifier' &&
        node.value.expression.name === '$listeners'
      ) {
        toFixNodes.push(node)
      }
    },
    leaveNode(node: Node) {}
  })
  return toFixNodes
}

function fix(node: Node): Operation[] {
  let fixOperations: Operation[] = []
  fixOperations.push(OperationUtils.remove(node))
  return fixOperations
}
