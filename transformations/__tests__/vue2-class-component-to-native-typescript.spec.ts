import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../vue2-class-component-to-native-typescript.ts')

defineInlineTest(
  transform,
  {},
  `import { Component } from 'vue-class-component'`,
  ``,
  'removes vue-class-component'
)
