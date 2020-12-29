jest.autoMockOff()

import { defineTest } from 'jscodeshift/src/testUtils'

defineTest(__dirname, 'vuex-v4', {}, 'vuex-v4/store')
defineTest(__dirname, 'vuex-v4', {}, 'vuex-v4/vuex-dot-store')
defineTest(__dirname, 'vuex-v4', {}, 'vuex-v4/import-alias')
