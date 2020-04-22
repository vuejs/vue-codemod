import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'
import type { ImportSpecifier, ImportDefaultSpecifier } from 'jscodeshift'

type Params = {
  specifier:
    | string
    | {
        local?: string
        imported: string
      }
  source: string
}

// TODO: add namespaced import
export const transformAST: ASTTransformation<Params> = (
  { root, j },
  { specifier, source }
) => {
  const localName =
    typeof specifier === 'string'
      ? specifier
      : specifier.local || specifier.imported

  const duplicate = root.find(j.ImportDeclaration, {
    specifiers: (arr: Array<ImportSpecifier | ImportDefaultSpecifier>) =>
      // @ts-ignore there's a bug in ast-types definition, the `local` should be non-nullable
      arr.some((s) => s.local.name === localName),
    source: {
      value: source,
    },
  })
  if (duplicate.length) {
    return
  }

  let newImportSpecifier
  if (typeof specifier === 'string') {
    newImportSpecifier = j.importDefaultSpecifier(j.identifier(specifier))
  } else {
    newImportSpecifier = j.importSpecifier(
      j.identifier(specifier.imported),
      j.identifier(specifier.local || specifier.imported)
    )
  }

  const matchedDecl = root.find(j.ImportDeclaration, {
    source: {
      value: source,
    },
  })
  if (matchedDecl.length) {
    // add new specifier to the existing import declaration
    matchedDecl.get(0).node.specifiers.push(newImportSpecifier)
  } else {
    const newImportDecl = j.importDeclaration(
      [newImportSpecifier],
      j.stringLiteral(source)
    )

    const lastImportDecl = root.find(j.ImportDeclaration).at(-1)
    if (lastImportDecl.length) {
      // add the new import declaration after all other import declarations
      lastImportDecl.insertAfter(newImportDecl)
    } else {
      // add new import declaration at the beginning of the file
      root.get().node.program.body.unshift(newImportDecl)
    }
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
