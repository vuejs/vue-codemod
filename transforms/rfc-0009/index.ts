import { Transform } from "jscodeshift"
import adapt from '../../utils/adapter'

import removeProductionTip from './remove-production-tip'
import transformMount from './transformMount'

const transform: Transform = (file, api) => {
  const j = api.jscodeshift
  const root = j(file.source)

  // add a `createApp` import
  const vueImportExpr = root.find(j.ImportDeclaration, {
    source: {
      value: 'vue'
    }
  })
  vueImportExpr.forEach(({ node }) => {
    node.specifiers.push(j.importSpecifier(j.identifier('createApp')))
  })

  removeProductionTip(j, root)
  transformMount(j, root)

  // remove extraneous Vue import
  const localVueUsages = root.find(j.Identifier, { name: 'Vue' })
  if (localVueUsages.length === 1) {
    localVueUsages.closest(j.ImportDefaultSpecifier).remove()
  }

  return root.toSource({ lineTerminator: '\n' })
}

export default adapt(transform)
