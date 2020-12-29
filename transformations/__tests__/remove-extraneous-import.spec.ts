import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../remove-extraneous-import')

defineInlineTest(
  transform,
  {
    localBinding: 'Vue',
  },
  `import Vue from "vue";`,
  ``,
  'Remove extraneous default import'
)

defineInlineTest(
  transform,
  {
    localBinding: 'createApp',
  },
  `import { createApp } from "vue";`,
  ``,
  'Remove extraneous named import'
)

defineInlineTest(
  transform,
  {
    localBinding: 'createVueApp',
  },
  `import { createApp as createVueApp } from "vue";`,
  ``,
  'Remove extraneous named import with alias'
)

defineInlineTest(
  transform,
  {
    localBinding: 'Vue',
  },
  `import * as Vue from "vue";`,
  ``,
  'Remove extraneous namespaced import'
)

defineInlineTest(
  transform,
  {
    localBinding: 'style',
  },
  `import style from "./style.css";`,
  `import "./style.css";`,
  'Do not remove import declaration for modules with possible side effects'
)

defineInlineTest(
  transform,
  {
    localBinding: 'Vue',
  },
  `import Vue from "vue";\nnew Vue()`,
  `import Vue from "vue";\nnew Vue()`,
  'Do not touch the code if the import is in use'
)
