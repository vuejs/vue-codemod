import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../add-import')

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
  `import VueCompositionApi, { defineComponent } from "@vue/composition-api";`,
  `import { defineComponent } from "vue";\nimport VueCompositionApi from "@vue/composition-api";`,
  'do not transform the default import' // it's taken care of by `remove-vue-use`
)
