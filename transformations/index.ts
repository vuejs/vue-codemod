import vueRouter3to4 from './vue-router-3-to-4'
import vuex3to4 from './vuex-3-to-4'

import addImport from './add-import'
import removeExtraneousImport from './remove-extraneous-import'

const transformationMap: {
  [name: string]: Function
} = {
  // 'new-global-api': newGlobalAPI,
  // 'rfc04-and-09': newGlobalAPI,
  'vue-router-3-to-4': vueRouter3to4,
  'vuex-4-to-4': vuex3to4,

  // atomic ones
  'create-app-mount': createAppMount,

  // utility tranformations
  'add-import': addImport,
  'remove-extraneous-import': removeExtraneousImport,
}

export default transformationMap
