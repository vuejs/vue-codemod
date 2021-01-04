import type {
  ASTNode,
  ASTPath,
  Collection,
  Identifier,
  ObjectExpression,
} from 'jscodeshift'
import type { Context } from './wrapAstTransformation'

export function getVueOptionsObject(
  context: Context
): Collection<ObjectExpression> {
  const paths: ASTPath<ObjectExpression>[] = []
  const { j, root, filename } = context

  function nodesToPaths<T>(
    nodes: T extends ASTNode ? T | T[] : never
  ): ASTPath<T>[] {
    return j(nodes).paths()
  }

  function getConstDeclarationInit(id: Identifier) {
    const declarator = root.findVariableDeclarators(id.name)
    const declarationKind = declarator.closest(j.VariableDeclaration).nodes()[0]
      .kind

    if (declarationKind !== 'const') {
      return null
    }

    return declarator.nodes()[0].init
  }

  function hasRenderOrTemplateProps(obj: ObjectExpression) {
    return obj.properties.some((prop) => {
      if (j.SpreadElement.check(prop) || j.SpreadProperty.check(prop)) {
        return false
      }

      if (j.StringLiteral.check(prop.key)) {
        return prop.key.value === 'render' || prop.key.value === 'template'
      }

      if (j.Identifier.check(prop.key)) {
        return prop.key.name === 'render' || prop.key.name === 'template'
      }
    })
  }

  if (filename.endsWith('.vue')) {
    // (.vue) export default {}
    const defaultObjectExport = root
      .find(j.ExportDefaultDeclaration)
      .map((path) => {
        const decl = path.node.declaration

        if (j.ObjectExpression.check(decl)) {
          return nodesToPaths(decl)
        }

        if (j.Identifier.check(decl)) {
          const init = getConstDeclarationInit(decl)
          if (init && j.ObjectExpression.check(init)) {
            return nodesToPaths(init)
          }
        }

        return null
      })

    paths.push(...defaultObjectExport.paths())
  } else {
    // (.js) export default {} with `render` or `template` option
    const defaultObjectExport = root
      .find(j.ExportDefaultDeclaration)
      .map((path) => {
        const decl = path.node.declaration

        if (j.ObjectExpression.check(decl) && hasRenderOrTemplateProps(decl)) {
          return nodesToPaths(decl)
        }

        if (j.Identifier.check(decl)) {
          const init = getConstDeclarationInit(decl)
          if (
            init &&
            j.ObjectExpression.check(init) &&
            hasRenderOrTemplateProps(init)
          ) {
            return nodesToPaths(init)
          }
        }
      })

    paths.push(...defaultObjectExport.paths())
  }

  // defineComponent({})
  // new Vue({})
  // Vue.component('name', {})

  return j(paths)
}
