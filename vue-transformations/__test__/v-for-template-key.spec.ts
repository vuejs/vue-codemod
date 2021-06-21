import { runTest } from '../../src/testUtils'

runTest(
  'Moves the key from the Template child node to Template',
  'v-for-template-key',
  'v-for-template-key',
  'vue',
  'vue'
)
runTest(
  ':key is not the attribute of v-for template child',
  'v-for-template-key',
  'without-v-for-template',
  'vue',
  'vue'
)
