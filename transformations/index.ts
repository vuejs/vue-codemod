const transformationMap: {
  [name: string]: Function
} = {
  'new-global-api': require('./new-global-api'),
  'vue-router-3-to-4': require('./vue-router-3-to-4'),
  'vuex-4-to-4': require('./vuex-3-to-4'),

  // atomic ones
  'create-app-mount': require('./create-app-mount'),
  'remove-contextual-h': require('./remove-contextual-h'),
  'remove-production-tip': require('./remove-production-tip'),
  'remove-trivial-root': require('./remove-trivial-root'),

  // generic utility tranformations
  'add-import': require('./add-import'),
  'remove-extraneous-import': require('./remove-extraneous-import'),
}

export default transformationMap
