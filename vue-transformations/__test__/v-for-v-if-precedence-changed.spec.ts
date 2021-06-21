import { runTest } from '../../src/testUtils'

runTest(
  'Fix the precedence problem of v-for and v-if before vue 2.6',
  'v-for-v-if-precedence-changed',
  'v-for-if-with-key',
  'vue',
  'vue'
)

runTest(
  'Fix the precedence problem of v-for and v-if before vue 2.6',
  'v-for-v-if-precedence-changed',
  'v-for-if-without-key',
  'vue',
  'vue'
)
