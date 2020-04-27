// this file is served as a boilerplate template for writing more complex transformations
import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

// TODO: SetupContext.refs does not exist in Vue 3.0
export const transformAST: ASTTransformation = ({ root, j }) => {
  const importDecl = root.find(j.ImportDeclaration, {
    source: {
      value: '@vue/composition-api',
    },
  })

  const specifiers = importDecl.find(j.ImportSpecifier)
  const namespaceSpecifier = importDecl.find(j.ImportNamespaceSpecifier)

  const newImportDecl = j.importDeclaration(
    [...specifiers.nodes()],
    j.stringLiteral('vue')
  )
  let namespaceImportDecl
  if (namespaceSpecifier.length) {
    namespaceImportDecl = j.importDeclaration(
      [...specifiers.nodes()],
      j.stringLiteral('vue')
    )
  }

  const lastImportDecl = root.find(j.ImportDeclaration).at(-1)
  if (lastImportDecl.length) {
    // add the new import declaration after all other import declarations
    lastImportDecl.insertAfter(newImportDecl)

    if (namespaceImportDecl) {
      lastImportDecl.insertAfter(namespaceImportDecl)
    }
  } else {
    // add new import declaration at the beginning of the file
    const { body } = root.get().node.program
    body.unshift(newImportDecl)

    if (namespaceImportDecl) {
      body.unshift(namespaceImportDecl)
    }
  }

  importDecl.forEach((path) => {
    // the default import should be left untouched to be taken care of by `remove-vue-use`
    path.node.specifiers = path.node.specifiers.filter((s) =>
      j.ImportDefaultSpecifier.check(s)
    )

    if (!path.node.specifiers.length) {
      path.prune()
    }
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
