import { runTest } from '../../src/testUtils'

runTest(
  'Fix v-bind Merge Behavior',
  'v-bind-order-sensitive',
  'v-bind-object-not-in-the-end',
  'vue',
  'vue'
)

runTest(
  'Fix v-bind Merge Behavior',
  'v-bind-order-sensitive',
  'v-bind-object-in-the-end',
  'vue',
  'vue'
)
