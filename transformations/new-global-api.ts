import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import { transformAST as vueAsNamespaceImport } from './vue-as-namespace-import'
import { transformAST as importCompositionApiFromVue } from './import-composition-api-from-vue'
import { transformAST as newVueTocreateApp } from './new-vue-to-create-app'
import { transformAST as rootPropToUse } from './root-prop-to-use'
import { transformAST as removeTrivialRoot } from './remove-trivial-root'
import { transformAST as removeProductionTip } from './remove-production-tip'
import { transformAST as removeVueUse } from './remove-vue-use'
import { transformAST as removeContextualHFromRender } from './remove-contextual-h-from-render'

import { transformAST as removeExtraneousImport } from './remove-extraneous-import'

export const transformAST: ASTTransformation = (context) => {
  vueAsNamespaceImport(context)
  importCompositionApiFromVue(context)
  newVueTocreateApp(context)
  rootPropToUse(context, { rootPropName: 'store' })
  rootPropToUse(context, { rootPropName: 'router' })
  removeTrivialRoot(context)
  removeProductionTip(context)

  // TODO:
  // should analyze the AST to get the default import of vue-router and vuex,
  // rather than hard-coding the names
  removeVueUse(context, { removablePlugins: ['VueRouter', 'Vuex'] })
  removeContextualHFromRender(context)

  removeExtraneousImport(context, { localBinding: 'Vue' })
  removeExtraneousImport(context, { localBinding: 'Vuex' })
  removeExtraneousImport(context, { localBinding: 'VueRouter' })
}

export default wrap(transformAST)
export const parser = 'babylon'
