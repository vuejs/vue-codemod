import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../remove-vue-use')

defineInlineTest(
  transform,
  {},
  `Vue.use(VueRouter)`,
  ``,
  `correctly remove Vue.use`
)

defineInlineTest(
  transform,
  {},
  `app.use(router);`,
  `app.use(router);`,
  `don't remove app.use`
)
