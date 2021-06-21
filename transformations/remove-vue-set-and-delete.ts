// To remove:
// Vue.set / Vue.delete
// this.$set / this.$delete
// vm = this; this.$set / this.$delete

import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import type * as N from 'jscodeshift'

export const transformAST: ASTTransformation = context => {
  const { root, j } = context

  const isVue = (node: N.ASTNode) => {
    return j.Identifier.check(node) && node.name === 'Vue'
  }

  const setOrDeleteCalls = root
    .find(j.CallExpression, (n: N.CallExpression) => {
      if (
        !j.MemberExpression.check(n.callee) ||
        !j.Identifier.check(n.callee.property)
      ) {
        return false
      }

      const propName = n.callee.property.name

      if (
        (propName === 'set' || propName === 'delete') &&
        isVue(n.callee.object)
      ) {
        return true
      }

      if (propName === '$set' || propName === '$delete') {
        // we need the path & scope to check if the object is `this`
        // so leave it to the filter function
        return true
      }

      return false
    })
    .filter(path => {
      const prop = (path.node.callee as N.MemberExpression)
        .property as N.Identifier

      // only the object of `.$set` and `.$delete` is pending for check
      if (prop.name !== '$set' && prop.name !== '$delete') {
        return true
      }

      const obj = (path.node.callee as N.MemberExpression).object

      if (j.ThisExpression.check(obj)) {
        return true
      }

      if (!j.Identifier.check(obj)) {
        return false
      }

      const decls = j(path).getVariableDeclarators(p => obj.name)
      if (decls && decls.length === 1) {
        const declPath = decls.paths()[0]
        const declNode = declPath.node
        const declStmt = declPath.parent.node

        return (
          j.VariableDeclarator.check(declNode) &&
          (declStmt as N.VariableDeclaration).kind === 'const' &&
          j.Identifier.check(declNode.id) &&
          j.ThisExpression.check(declNode.init)
        )
      }

      return false
    })

  setOrDeleteCalls.replaceWith(({ node }) => {
    if (node.arguments.some(arg => j.SpreadElement.check(arg))) {
      // TODO: add a comment to inform the user that this kind of usage can't be transformed
      return node
    }

    const prop = (node.callee as N.MemberExpression).property as N.Identifier
    if (prop.name === '$set' || prop.name === 'set') {
      return j.assignmentExpression(
        '=',
        // @ts-ignore
        j.memberExpression(node.arguments[0], node.arguments[1], true),
        // @ts-ignore
        node.arguments[2]
      )
    }

    if (prop.name === '$delete' || prop.name === 'delete') {
      return j.unaryExpression(
        'delete',
        // @ts-ignore
        j.memberExpression(node.arguments[0], node.arguments[1], true)
      )
    }

    // unreachable branch
    return node
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
