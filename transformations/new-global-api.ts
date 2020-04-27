import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

import { transformAST as treeShakableVue } from './tree-shakable-vue'
import { transformAST as importCompositionApiFromVue } from './import-composition-api-from-vue'
import { transformAST as createAppMount } from './create-app-mount'
import { transformAST as rootPropToUse } from './root-prop-to-use'
import { transformAST as removeTrivialRoot } from './remove-trivial-root'
import { transformAST as removeProductionTip } from './remove-production-tip'
import { transformAST as removeVueUse } from './remove-vue-use'
import { transformAST as removeContextualHFromRender } from './remove-contextual-h-from-render'

import { transformAST as removeExtraneousImport } from './remove-extraneous-import'

export const transformAST: ASTTransformation = (context) => {
  treeShakableVue(context)
  importCompositionApiFromVue(context)
  createAppMount(context)
  rootPropToUse(context, { rootPropName: 'store' })
  rootPropToUse(context, { rootPropName: 'router' })
  removeTrivialRoot(context)
  removeProductionTip(context)
  removeVueUse(context)
  removeContextualHFromRender(context)

  removeExtraneousImport(context, { localBinding: 'Vue' })
  removeExtraneousImport(context, { localBinding: 'Vuex' })
  removeExtraneousImport(context, { localBinding: 'VueRouter' })
}

export default wrap(transformAST)
export const parser = 'babylon'
