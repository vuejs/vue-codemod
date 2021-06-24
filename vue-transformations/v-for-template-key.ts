import * as OperationUtils from '../src/operationUtils'
import * as parser from 'vue-eslint-parser'
import * as util from 'util'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { Operation } from '../src/operationUtils'
import type { VueASTTransformation } from '../src/wrapVueTransformation'
import wrap from '../src/wrapVueTransformation'
import createDebug from 'debug'

const debug = createDebug('vue-codemod:rule')

let operatingParentElements: any = []

/**
 * 每一个实际的规则，需要做以下几件事：
 * 1、findNodes(fileInfo, ast): 寻找匹配规则的节点
 * 2、fix(nodes): 完善匹配节点的增删改逻辑
 * 3、applyFix(fileInfo, tempFixes): 执行fixer，对源码进行增删改，并返回转换后的代码
 * @param context
 */

export const transformAST: VueASTTransformation = context => {
  let fixOperations: Operation[] = []
  const toFixNodes: Node[] = findNodes(context)
  toFixNodes.forEach(node => {
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
        node.key.type === 'VDirectiveKey' &&
        node.key.name.name === 'bind' &&
        node.key.argument?.type === 'VIdentifier' &&
        node.key.argument?.name === 'key'
      ) {
        toFixNodes.push(node)
      }
    },
    leaveNode(node: Node) {}
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
  let hasForAttr: boolean = false
  target.startTag.attributes
    .filter(
      (attr: any) =>
        attr.type === 'VAttribute' &&
        attr.key.type === 'VDirectiveKey' &&
        attr.key.name.name === 'for'
    )
    .forEach(() => {
      hasForAttr = true
    })
  if (hasForAttr) {
    debug('No operator, target element has for attribute.')
    return fixOperations
  }

  let elder: any = null
  let elderHasKey: boolean = false
  let elderHasFor: boolean = false
  let tmp: any = target
  // find template parent
  while (elder == null && tmp != null) {
    elderHasKey = false
    elderHasFor = false
    tmp = tmp.parent
    if (tmp == null || tmp.type != 'VElement' || tmp.name != 'template') {
      continue
    }

    tmp.startTag.attributes
      .filter(
        (attr: any) =>
          attr.type === 'VAttribute' &&
          attr.key.type === 'VDirectiveKey' &&
          attr.key.name.name === 'for'
      )
      .forEach((element: any) => {
        elderHasFor = true
        elder = element
      })

    tmp.startTag.attributes
      .filter(
        (attr: any) =>
          attr.type === 'VAttribute' &&
          attr.key.type === 'VDirectiveKey' &&
          attr.key.name.name === 'bind' &&
          attr.key.argument?.type === 'VIdentifier' &&
          attr.key.argument?.name === 'key'
      )
      .forEach(() => {
        elderHasKey = true
      })

    if (elderHasFor) {
      break
    }
  }

  if (!elderHasFor) {
    debug('No operator, elder element no for attribute.')
    return fixOperations
  }

  let expression: string = getExpression(node.value)

  fixOperations.push(OperationUtils.remove(node))
  if (
    !elderHasKey &&
    util.inspect(operatingParentElements).indexOf(util.inspect(elder.range)) ==
      -1
  ) {
    operatingParentElements.push(elder.range)
    fixOperations.push(
      OperationUtils.insertTextAfter(elder, ' :key=' + expression)
    )
  }
  return fixOperations
}

function getExpression(node: any): any {
  if (node.type == 'VExpressionContainer') {
    return '"' + getExpression(node.expression) + '"'
  } else if (node.type == 'BinaryExpression') {
    return (
      getExpression(node.left) +
      ' ' +
      node.operator +
      ' ' +
      getExpression(node.right)
    )
  } else if (node.type == 'Literal') {
    return "'" + node.value + "'"
  } else if (node.type == 'MemberExpression') {
    return getExpression(node.object) + '.' + node.property.name
  } else if (node.type == 'ObjectExpression') {
    let str: string = ''
    for (let index = 0; index < node.properties.length; index++) {
      if (
        node.properties[index].key == null ||
        node.properties[index].value == null
      ) {
        str = str + ''
      } else {
        str =
          str +
          getExpression(node.properties[index].key) +
          ':' +
          getExpression(node.properties[index].value)
      }
    }
    str = str.substring(0, str.length - 1)
    return '{' + str + '}'
  } else {
    return node.name
  }
}
