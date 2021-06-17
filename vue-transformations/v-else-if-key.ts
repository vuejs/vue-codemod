import * as OperationUtils from '../src/operationUtils'
import * as parser from 'vue-eslint-parser'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import type { VueASTTransformation } from '../src/wrapVueTransformation'
import wrap from '../src/wrapVueTransformation'

/**
 * 每一个实际的规则，需要做以下几件事：
 * 1、findNodes(fileInfo, ast): 寻找匹配规则的节点
 * 2、fix(nodes): 完善匹配节点的增删改逻辑
 * 3、applyFix(fileInfo, tempFixes): 执行fixer，对源码进行增删改，并返回转换后的代码
 * @param context
 */

export const transformAST: VueASTTransformation = (context) => {
  let fixOperations: Operation[] = []
  const toFixNodes: Node[] = findNodes(context)
  toFixNodes.forEach((node) => {
    // fix(node) 返回的为 Operation 数组，因此用 concat 合并多个数组
    fixOperations = fixOperations.concat(fix(node))
  })
  return fixOperations
}

export default wrap(transformAST)
/**
 * 定位 slot attribute 节点
 *
 * @param context { file: FileInfo, api: API }
 * @param templateBody
 * @returns 所有的 slot attribute 节点
 */
function findNodes(context: any): Node[] {
  const { file } = context
  const source = file.source
  const options = { sourceType: 'module' }
  const ast = parser.parse(source, options)
  let toFixNodes: Node[] = []
  let root: Node = <Node>ast.templateBody // 强制类型转换
  parser.AST.traverseNodes(root, {
    enterNode(node: Node) {
      if (
        node.type === 'VAttribute' &&
        node.key.type === 'VIdentifier' &&
        node.key.name === 'key'
      ) {
        toFixNodes.push(node)
      }
    },
    leaveNode(node: Node) {},
  })
  return toFixNodes
}
/**
 * The repair logic for
 * @param node The Target Node
 */
function fix(node: any): Operation[] {
  let fixOperations: Operation[] = []
  const target: any = node!.parent!.parent

  // The current node has no attribute that is v-for
  let havaBrotherAttr: boolean = false
  target.startTag.attributes
    .filter(
      (attr: any) =>
        attr.type === 'VAttribute' &&
        attr.key.type === 'VDirectiveKey' &&
        (attr.key.name.name === 'if' ||
          attr.key.name.name === 'else-if' ||
          attr.key.name.name === 'else')
    )
    .forEach((element: any) => {
      havaBrotherAttr = true
    })
  if (!havaBrotherAttr) {
    return fixOperations
  }

  fixOperations.push(OperationUtils.remove(node))

  return fixOperations
}
