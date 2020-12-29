import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../remove-vue-use')

defineInlineTest(
  transform,
  {
    removablePlugins: ['VueRouter'],
  },
  `Vue.use(VueRouter)`,
  ``,
  `correctly remove Vue.use`
)

defineInlineTest(
  transform,
  {
    removablePlugins: ['VueRouter'],
  },
  `import VueRouter from "vue-router";\nVue.use(VueRouter)`,
  ``,
  `should also remove the extraneous import declaration`
)

defineInlineTest(
  transform,
  {
    removablePlugins: ['VueRouter'],
  },
  `Vue.use(Vuetify)`,
  `Vue.use(Vuetify)`,
  `do not remove those are not in the 'removablePlugins' list`
)

defineInlineTest(
  transform,
  {},
  `app.use(router);`,
  `app.use(router);`,
  `don't remove app.use`
)
