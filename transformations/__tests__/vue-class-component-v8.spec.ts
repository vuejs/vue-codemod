import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../vue-class-component-v8')

defineInlineTest(
  transform,
  {},
  `import { Component } from 'vue-class-component'`,
  `import { Options as Component } from 'vue-class-component'`,
  'correctly transform import Component form vue-class-component'
)

defineInlineTest(
  transform,
  {},
  `import { Component, Props } from 'vue-class-component'`,
  `import { Options as Component, Props } from 'vue-class-component'`,
  'correctly transform import Component form vue-class-component w/ multiple import'
)
