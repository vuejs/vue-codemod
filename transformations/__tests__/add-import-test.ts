const { defineInlineTest } = require('jscodeshift/src/testUtils')
const transform = require('../add-import')

defineInlineTest(
  transform,
  {
    specifier: 'Vue',
    source: 'vue',
  },
  ``,
  `import Vue from "vue";`,
  'Add default import'
)

defineInlineTest(
  transform,
  {
    specifier: {
      imported: 'createApp',
    },
    source: 'vue',
  },
  ``,
  `import { createApp } from "vue";`,
  'Add named import'
)

defineInlineTest(
  transform,
  {
    specifier: {
      imported: 'createApp',
      local: 'createVueApp',
    },
    source: 'vue',
  },
  ``,
  `import { createApp as createVueApp } from "vue";`,
  'Add named import with an alias'
)

defineInlineTest(
  transform,
  {
    specifier: 'Vue',
    source: 'vue',
  },
  `import Vue from "vue";`,
  `import Vue from "vue";`,
  'Do not add duplicate default imports'
)

defineInlineTest(
  transform,
  {
    specifier: {
      imported: 'createApp',
    },
    source: 'vue',
  },
  `import { createApp } from "vue";`,
  `import { createApp } from "vue";`,
  'Do not add duplicate named imports'
)

defineInlineTest(
  transform,
  {
    specifier: {
      imported: 'createApp',
    },
    source: 'vue',
  },
  `import Vue from "vue";`,
  `import Vue, { createApp } from "vue";`,
  'Add named import as a sibling to another default import'
)

defineInlineTest(
  transform,
  {
    specifier: {
      imported: 'h',
    },
    source: 'vue',
  },
  `import { createApp } from "vue";`,
  `import { createApp, h } from "vue";`,
  'Add a named import as a sibling to another named import'
)
