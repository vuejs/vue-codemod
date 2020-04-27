import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../tree-shakable-vue')

defineInlineTest(
  transform,
  {},
  `import Vue from "vue";`,
  `import * as Vue from "vue";`,
  'correctly transform default import from vue'
)

defineInlineTest(
  transform,
  {},
  `import Vue, { nextTick } from "vue";`,
  `import * as Vue, { nextTick } from "vue";`,
  'correctly transform multiple imports from vue'
)
