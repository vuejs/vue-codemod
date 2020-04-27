// this file is served as a boilerplate template for writing more complex transformations
import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

import { transformAST as addImport } from './add-import'

type Params = {
  useCompositionApi: boolean
}

export const transformAST: ASTTransformation<Params | undefined> = (
  context,
  { useCompositionApi }: Params = {
    useCompositionApi: false,
  }
) => {
  const { root, j } = context
  const vueExtend = root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        name: 'Vue',
      },
      property: {
        name: 'extend',
      },
    },
  })

  if (vueExtend.length) {
    addImport(context, {
      specifier: {
        type: 'named',
        imported: 'defineComponent',
      },
      source: useCompositionApi ? '@vue/composition-api' : 'vue',
    })

    vueExtend.forEach(({ node }) => {
      node.callee = j.identifier('defineComponent')
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
