import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../global-filter')

defineInlineTest(
  transform,
  {},
  `const app = Vue.createApp(App)
Vue.filter('capitalize', function(value) {
  return value
})`,
  `const app = Vue.createApp(App)
app.config.globalProperties.$filters = {
  capitalize(value) {
    return value
  }
};`,
  'transform global filter'
)

defineInlineTest(
  transform,
  {},
  `const app = new Vue(App)
Vue.filter('capitalize', function(value) {
  return value
})`,
  `const app = new Vue(App)
Vue.filter('capitalize', function(value) {
  return value
})
`,
  'transform global filter(no effect and will warn)'
)




