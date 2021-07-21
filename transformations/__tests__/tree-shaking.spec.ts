import { defineInlineTest } from 'jscodeshift/src/testUtils'

const nextTick = require('../next-tick')
const observable = require('../observable')
const version = require('../version')
const treeShaking = require('../tree-shaking')

// Vue.nextTick() => nextTick()
defineInlineTest(
  nextTick,
  {},
  `import Vue from 'vue'
Vue.nextTick(() => {
  console.log('foo')
})
`,
  `import Vue, { nextTick } from 'vue';
nextTick(() => {
  console.log('foo')
})
`,
  'tree-shaking (Vue.nextTick() to nextTick())'
)

// Vue.observable() => reactive()
defineInlineTest(
  observable,
  {},
  `import Vue from 'vue'
const state = Vue.observable({ count: 0 })`,
  `import Vue, { reactive } from 'vue';
const state = reactive({ count: 0 })`,
  'tree-shaking (Vue.observable to reactive)'
)

// Vue.version() => version()
defineInlineTest(
  version,
  {},
  `import Vue from 'vue'
var version = Number(Vue.version.split('.')[0])`,
  `import Vue, { version } from 'vue';
var version = Number(version.split('.')[0])`,
  'tree-shaking (Vue.version to version)'
)

defineInlineTest(
  treeShaking,
  {},
  `import Vue from 'vue'
Vue.nextTick(function() {})
Vue.observable({ count: 0 })
Vue.version`,
  `import { nextTick, reactive, version } from 'vue';
nextTick(function() {})
reactive({ count: 0 })
version
`,
  'tree-shaking'
)
