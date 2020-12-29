import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import { transformAST as addImport } from './add-import'
import { transformAST as removeExtraneousImport } from './remove-extraneous-import'

// new Store() -> createStore()
export const transformAST: ASTTransformation = (context) => {
  const { j, root } = context

  const vuexImportDecls = root.find(j.ImportDeclaration, {
    source: {
      value: 'vuex',
    },
  })

  const importedVuex = vuexImportDecls.find(j.ImportDefaultSpecifier)
  const importedStore = vuexImportDecls.find(j.ImportSpecifier, {
    imported: {
      name: 'Store',
    },
  })

  if (importedVuex.length) {
    const localVuex = importedVuex.get(0).node.local.name
    const newVuexDotStore = root.find(j.NewExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: localVuex,
        },
        property: {
          name: 'Store',
        },
      },
    })

    newVuexDotStore.replaceWith(({ node }) => {
      return j.callExpression(
        j.memberExpression(
          j.identifier(localVuex),
          j.identifier('createStore')
        ),
        node.arguments
      )
    })
  }

  if (importedStore.length) {
    const localStore = importedStore.get(0).node.local.name
    const newStore = root.find(j.NewExpression, {
      callee: {
        type: 'Identifier',
        name: localStore,
      },
    })

    addImport(context, {
      specifier: {
        type: 'named',
        imported: 'createStore',
      },
      source: 'vuex',
    })
    newStore.replaceWith(({ node }) => {
      return j.callExpression(j.identifier('createStore'), node.arguments)
    })
    removeExtraneousImport(context, { localBinding: localStore })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
