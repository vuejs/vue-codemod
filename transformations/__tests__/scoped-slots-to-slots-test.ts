import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../scoped-slots-to-slots')

defineInlineTest(
  transform,
  {},
  `this.$scopedSlots
  this["$scopedSlots"]

  vm.$scopedSlots
  vm["$scopedSlots"]`,
  `this.$slots
  this["$slots"]

  vm.$slots
  vm["$slots"]`,
  'transform `$scopedSlots` to `$slots`'
)
