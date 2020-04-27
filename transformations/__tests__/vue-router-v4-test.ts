jest.autoMockOff()

import { defineTest } from 'jscodeshift/src/testUtils'

defineTest(__dirname, 'vue-router-v4', {}, 'vue-router-v4/create-router')

defineTest(__dirname, 'vue-router-v4', {}, 'vue-router-v4/create-history')
