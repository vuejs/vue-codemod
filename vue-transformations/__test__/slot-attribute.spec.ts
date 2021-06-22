import { runTest } from '../../src/testUtils'

runTest(
  'Convert usage of slot before vue 2.6',
  'slot-attribute',
  'slot-attribute',
  'vue',
  'vue'
)

runTest(
  'template element replace slot="xxx" to v-slot:xxx',
  'slot-attribute',
  'template-slot-attribute',
  'vue',
  'vue'
)

runTest(
  'Template is between style and script',
  'slot-attribute',
  'template-tag-slice',
  'vue',
  'vue'
)

runTest(
  'The v-slot attribute already exists in the upper template',
  'slot-attribute',
  'template-with-slot',
  'vue',
  'vue'
)
