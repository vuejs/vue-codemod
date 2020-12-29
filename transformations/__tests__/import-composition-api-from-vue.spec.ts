import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../import-composition-api-from-vue')

defineInlineTest(
  transform,
  {},
  `import { defineComponent } from "@vue/composition-api";`,
  `import { defineComponent } from "vue";`,
  'basic support'
)

defineInlineTest(
  transform,
  {},
  `import { defineComponent } from "@vue/composition-api";\nimport { computed } from "@vue/composition-api";`,
  `import { defineComponent, computed } from "vue";`,
  'correctly transform multiple import declarations'
)

defineInlineTest(
  transform,
  {},
  `import * as vca from "@vue/composition-api";`,
  `import * as vca from "vue";`,
  'correctly transform multiple import declarations'
)

defineInlineTest(
  transform,
  {},
  `import VueCompositionApi, { defineComponent } from "@vue/composition-api";\nimport { computed } from "@vue/composition-api";`,
  `import VueCompositionApi from "@vue/composition-api";\nimport { defineComponent, computed } from "vue";`,
  'do not transform the default import' // it's taken care of by `remove-vue-use`
)

defineInlineTest(
  transform,
  {},
  `import * as Vue from "vue";`,
  `import * as Vue from "vue";`,
  'do nothing if no @vue/composition-api import encountered'
)
