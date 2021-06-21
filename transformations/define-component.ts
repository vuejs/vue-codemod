import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import { transformAST as addImport } from './add-import'
import { transformAST as removeExtraneousImport } from './remove-extraneous-import'

type Params = {
  useCompositionApi: boolean
}

export const transformAST: ASTTransformation<Params | undefined> = (
  context,
  { useCompositionApi }: Params = {
    useCompositionApi: false
  }
) => {
  const { root, j, filename } = context
  const importDefineComponent = () =>
    addImport(context, {
      specifier: {
        type: 'named',
        imported: 'defineComponent'
      },
      source: useCompositionApi ? '@vue/composition-api' : 'vue'
    })

  const vueExtend = root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        name: 'Vue'
      },
      property: {
        name: 'extend'
      }
    }
  })
  if (vueExtend.length) {
    importDefineComponent()
    vueExtend.forEach(({ node }) => {
      node.callee = j.identifier('defineComponent')
    })
    removeExtraneousImport(context, { localBinding: 'Vue' })
  }

  if (filename && filename.endsWith('.vue')) {
    const defaultExport = root.find(j.ExportDefaultDeclaration)
    if (!defaultExport.length) {
      return
    }

    const declarationNode = defaultExport.nodes()[0].declaration
    if (!j.ObjectExpression.check(declarationNode)) {
      return
    }

    importDefineComponent()
    defaultExport.nodes()[0].declaration = j.callExpression(
      j.identifier('defineComponent'),
      [declarationNode]
    )
    removeExtraneousImport(context, { localBinding: 'Vue' })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
