import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../vue2-class-component-to-native.ts')

defineInlineTest(
  transform,
  {},
  `import { Component } from 'vue-class-component'`,
  ``,
  'removes vue-class-component'
)
