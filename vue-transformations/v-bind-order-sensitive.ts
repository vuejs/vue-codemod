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
        node.key.name.name === 'bind' &&
        node.parent.attributes.length > 1
      ) {
        toFixNodes.push(node)
      }
    },
    leaveNode(node: Node) {}
  })
  return toFixNodes
}

function fix(node: Node, source: string): Operation[] {
  let fixOperations: Operation[] = []
  // get parent node
  const target: any = node!.parent
  // get the value of v-bind according to the range
  const bindValue: string = source.slice(node.range[0], node.range[1]) + ' '
  // remove node
  if (target.attributes[target.attributes.length - 1] === node) {
    fixOperations.push(OperationUtils.remove(node))
  } else {
    fixOperations.push(
      OperationUtils.removeRange([node.range[0], node.range[1] + 1])
    )
  }
  // add node to the first
  fixOperations.push(
    OperationUtils.insertTextBefore(target.attributes[0], bindValue)
  )
  return fixOperations
}
