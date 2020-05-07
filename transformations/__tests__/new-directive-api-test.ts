import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../new-directive-api')

defineInlineTest(
  transform,
  {},
  `Vue.directive('my-directive', {
  bind: function onBind () {},
  inserted: () => console.log('onInserted'),
  componentUpdated: function onComponentUdpated () {},
  unbind () { console.log('unbind') }
})`,
  `Vue.directive('my-directive', {
  beforeMount: function onBind () {},
  mounted: () => console.log('onInserted'),
  updated: function onComponentUdpated () {},
  unmounted () { console.log('unbind') }
})`,
  'transform directive lifecycle hooks'
)

defineInlineTest(
  transform,
  {},
  `Vue.directive('my-directive', {
  bind: function onBind () {},
  inserted: () => console.log('onInserted'),
  update: function onUpdate () {},
  componentUpdated: function onComponentUdpated () {},
  unbind () { console.log('unbind') }
})`,
  `Vue.directive('my-directive', {
  beforeMount: function onBind () {},
  mounted: () => console.log('onInserted'),

  /* __REMOVED__: In Vue 3, there's no 'update' hook for directives */
  updated: function onComponentUdpated () {},

  unmounted () { console.log('unbind') }
})`,
  'replace the `updated` hook with a __REMOVED__ comment'
)

// TODO: VNode API
