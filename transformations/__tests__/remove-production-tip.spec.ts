import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../remove-production-tip')

defineInlineTest(transform, {}, `Vue.config.productionTip = true`, ``)
