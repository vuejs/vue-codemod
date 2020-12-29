import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import type {
  ImportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
} from 'jscodeshift'

type DefaultSpecifierParam = {
  type: 'default'
  local: string
}
type NamedSpecifierParam = {
  type: 'named'
  imported: string
  local?: string
}
type NamespaceSpecifierParam = {
  type: 'namespace'
  local: string
}

type Params = {
  specifier:
    | DefaultSpecifierParam
    | NamedSpecifierParam
    | NamespaceSpecifierParam
  source: string
}

export const transformAST: ASTTransformation<Params> = (
  { root, j },
  { specifier, source }
) => {
  let localBinding: string
  if (specifier.type === 'named') {
    localBinding = specifier.local || specifier.imported
  } else {
    localBinding = specifier.local
  }

  const duplicate = root.find(j.ImportDeclaration, {
    specifiers: (
      arr: Array<
        ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
      >
    ) =>
      // @ts-ignore there's a bug in ast-types definition, the `local` should be non-nullable
      arr.some((s) => s.local.name === localBinding),
    source: {
      value: source,
    },
  })
  if (duplicate.length) {
    return
  }

  let newImportSpecifier
  if (specifier.type === 'default') {
    newImportSpecifier = j.importDefaultSpecifier(j.identifier(specifier.local))
  } else if (specifier.type === 'named') {
    newImportSpecifier = j.importSpecifier(
      j.identifier(specifier.imported),
      j.identifier(localBinding)
    )
  } else {
    // namespace
    newImportSpecifier = j.importNamespaceSpecifier(j.identifier(localBinding))
  }

  const matchedDecl = root.find(j.ImportDeclaration, {
    source: {
      value: source,
    },
  })
  if (
    matchedDecl.length &&
    !matchedDecl.find(j.ImportNamespaceSpecifier).length
  ) {
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
