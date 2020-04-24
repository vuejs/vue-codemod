jest.autoMockOff()

import { defineTest } from 'jscodeshift/src/testUtils'

defineTest(
  __dirname,
  'vue-router-3-to-4',
  {},
  'vue-router-3-to-4/create-router'
)

defineTest(
  __dirname,
  'vue-router-3-to-4',
  {},
  'vue-router-3-to-4/create-history'
)
