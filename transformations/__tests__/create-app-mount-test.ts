import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../create-app-mount')

defineInlineTest(
  transform,
  {},
  `new Vue({ render: h => h(App) }).$mount("#app")`,
  `import { createApp } from "vue";\ncreateApp({ render: h => h(App) }).mount("#app")`,
  'transform `new Vue().$mount` with options to createApp().mount'
)

defineInlineTest(
  transform,
  {},
  `new MyComponent().$mount("#app")`,
  `import { createApp } from "vue";\ncreateApp(MyComponent).mount("#app")`,
  'transform `new MyComponent().$mount`'
)

defineInlineTest(
  transform,
  {},
  `new MyComponent({ foo: "bar" }).$mount("#app")`,
  `import { createApp } from "vue";\ncreateApp(MyComponent, { foo: "bar" }).mount("#app")`,
  'transform `new MyComponent().$mount` with additional options'
)

defineInlineTest(
  transform,
  { includeMaybeComponents: false },
  `new MyComponent().$mount("#app")`,
  `new MyComponent().$mount("#app")`,
  'do not transform `new MyComponent().$mount` if `includeMaybeComponents` disabled'
)

// defineInlineTest(transform, {}, ``, ``, 'transform `new Vue` with `el` prop')

// defineInlineTest(
//   transform,
//   {},
//   ``,
//   ``,
//   'transform `new MyComponent` with `el` prop'
// )

// defineInlineTest(
//   transform,
//   {},
//   ``,
//   ``,
//   'do not transform `new Vue()` without .$mount or `el` prop'
// )
