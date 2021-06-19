import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../new-vue-to-create-app')

defineInlineTest(
  transform,
  {},
  `new Vue({ template: "<div>hello</div>" })`,
  `Vue.createApp({ template: "<div>hello</div>" })`,
  'transform `new Vue()` to createApp()'
)

defineInlineTest(
  transform,
  {},
  `new Vue()`,
  `Vue.createApp()`,
  'transform `new Vue()` to createApp() with no arguments'
)

defineInlineTest(
  transform,
  {},
  `new Vue({ render: h => h(App) }).$mount("#app")`,
  `Vue.createApp({ render: h => h(App) }).mount("#app")`,
  'transform `new Vue().$mount` with options to createApp().mount'
)

defineInlineTest(
  transform,
  {},
  `var vm = new Vue({ template: "<div>hello</div>" }); vm.$mount("#app")`,
  `var vm = Vue.createApp({ template: "<div>hello</div>" }); vm.mount("#app")`,
  'transform `vm.$mount` to vm.mount'
)

defineInlineTest(
  transform,
  {},
  `new MyComponent().$mount("#app")`,
  `Vue.createApp(MyComponent).mount("#app")`,
  'transform `new MyComponent().$mount`'
)

defineInlineTest(
  transform,
  {},
  `new MyComponent({ foo: "bar" }).$mount("#app")`,
  `Vue.createApp(MyComponent, { foo: "bar" }).mount("#app")`,
  'transform `new MyComponent().$mount` with additional options'
)

defineInlineTest(
  transform,
  { includeMaybeComponents: false },
  `new MyComponent().$mount("#app"); vm.$mount("#app")`,
  `new MyComponent().$mount("#app"); vm.$mount("#app")`,
  'do not transform `new MyComponent().$mount` or `vm.$mount` if `includeMaybeComponents` disabled'
)

defineInlineTest(
  transform,
  {},
  `new Vue({ el: "#app", render: h => h(App) })`,
  `Vue.createApp({\n  render: h => h(App)\n}).mount("#app")`,
  'transform `new Vue` with `el` prop'
)

defineInlineTest(
  transform,
  {},
  `new MyComponent({ el: "#app" })`,
  `Vue.createApp(MyComponent).mount("#app")`,
  'transform `new MyComponent` with `el` prop'
)
