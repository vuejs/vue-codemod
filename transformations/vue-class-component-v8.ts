import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

// import { Component } from 'vue-class-component' ->
// import { Options as Component } from 'vue-class-component'
export const transformAST: ASTTransformation = (context) => {
  const { j, root } = context

  const vueClassComponentImportDecls = root.find(j.ImportDeclaration, {
    source: {
      value: 'vue-class-component',
    },
  })

  const ComponentImportSpec = vueClassComponentImportDecls.find(
    j.ImportSpecifier,
    {
      imported: {
        name: 'Component',
      },
    }
  )

  ComponentImportSpec.replaceWith(({ node }) => {
    return j.importSpecifier(j.identifier('Options'), j.identifier('Component'))
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
