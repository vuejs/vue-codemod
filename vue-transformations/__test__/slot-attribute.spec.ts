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
