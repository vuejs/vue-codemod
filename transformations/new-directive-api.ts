import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

const hookNameMap: { [key: string]: string } = {
  bind: 'beforeMount',
  inserted: 'mounted',
  componentUpdated: 'updated',
  unbind: 'unmounted',
}

export const transformAST: ASTTransformation = ({ root, j }) => {
  const directiveRegistration = root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        name: 'Vue',
      },
      property: {
        name: 'directive',
      },
    },
  })

  directiveRegistration.forEach(({ node }) => {
    if (
      node.arguments.length === 2 &&
      j.ObjectExpression.check(node.arguments[1])
    ) {
      const directiveOptions = node.arguments[1]
      let updateIndex = -1

      directiveOptions.properties.forEach((prop, index) => {
        if (
          j.SpreadElement.check(prop) ||
          j.SpreadProperty.check(prop) ||
          !j.Identifier.check(prop.key)
        ) {
          return
        }

        if (hookNameMap[prop.key.name]) {
          prop.key.name = hookNameMap[prop.key.name]
        }
        if (prop.key.name === 'update') {
          updateIndex = index
        }
      })

      if (updateIndex !== -1) {
        const nextProp =
          directiveOptions.properties[updateIndex + 1] ||
          // if `update` is the last property
          directiveOptions.properties[updateIndex - 1]
        nextProp.comments = nextProp.comments || []
        nextProp.comments.push(
          j.commentBlock(
            ` __REMOVED__: In Vue 3, there's no 'update' hook for directives `
          )
        )
        directiveOptions.properties.splice(updateIndex, 1)
        // TODO: should warn user in the console
      }
    }
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
