jest.autoMockOff()

import { defineTest } from 'jscodeshift/src/testUtils'

defineTest(__dirname, 'vuex-3-to-4', {}, 'vuex-3-to-4/store')
defineTest(__dirname, 'vuex-3-to-4', {}, 'vuex-3-to-4/vuex-dot-store')
defineTest(__dirname, 'vuex-3-to-4', {}, 'vuex-3-to-4/import-alias')
