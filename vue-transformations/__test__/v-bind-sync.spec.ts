import { runTest } from '../../src/testUtils'

runTest(
  'Replace .sync modifiers in v-bind with v-model',
  'v-bind-sync',
  'v-bind-sync',
  'vue',
  'vue'
)
