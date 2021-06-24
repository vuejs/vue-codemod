import { Node } from 'vue-eslint-parser/ast/nodes'
import * as OperationUtils from '../src/operationUtils'
import type { Operation } from '../src/operationUtils'
import type { VueASTTransformation } from '../src/wrapVueTransformation'
import * as parser from 'vue-eslint-parser'
import wrap from '../src/wrapVueTransformation'
import _ from 'lodash'

export const transformAST: VueASTTransformation = context => {
  let fixOperations: Operation[] = []
  const { file } = context
  const source = file.source
  const toFixNodes: Node[] = findNodes(context)
  toFixNodes.forEach(node => {
    fixOperations = fixOperations.concat(fix(node, source))
  })
  return fixOperations
}

export default wrap(transformAST)
/**
 * search v-on nodes
 *
 * @param context
 * @returns v-on attribute nodes
 */
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
        node.directive &&
        node.key.name.name === 'on'
      ) {
        toFixNodes.push(node)
      }
    },
    leaveNode(node: Node) {}
  })
  return toFixNodes
}
/**
 * fix logic
 * @param node
 */
function fix(node: Node, source: string): Operation[] {
  let fixOperations: Operation[] = []
  // @ts-ignore
  const keyNode = node.key
  const argument = keyNode.argument
  const modifiers = keyNode.modifiers

  if (argument !== null) {
    modifiers.forEach((mod: any) => {
      if (mod?.name === 'native') {
        const comment =
        '<!-- native modifier has been removed, please confirm whether the function has been affected  -->'
        const vStartTag = mod.parent.parent.parent
        const vElement = vStartTag.parent
        const siblings = vElement.parent.children
        let insertIndent = ''
        if (siblings[0] !== vElement) {
          let preEle = siblings[0]
          for (let i = 1; i < siblings.length; i++) {
            if (siblings[i].range === vElement.range) {
              insertIndent = preEle.value
              break
            } else {
              preEle = siblings[i]
            }
          }
        }
        // insert a comment about navite modifier
        fixOperations.push(OperationUtils.insertTextBefore(vStartTag, comment))
        // insert new line and indents
        fixOperations.push(
          OperationUtils.insertTextBefore(vStartTag, insertIndent)
        )
        // remove native modifier on 'v-on' directive
        fixOperations.push(
          OperationUtils.removeRange([mod.range[0] - 1, mod.range[1]])
        )
      }
    })
  }

  return fixOperations
}
