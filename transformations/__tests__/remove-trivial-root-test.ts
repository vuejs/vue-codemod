import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../remove-trivial-root')

defineInlineTest(
  transform,
  {},
  `createApp({ render: () => h(App) });`,
  `createApp(App);`,
  'remove trivial arrow function render'
)

defineInlineTest(
  transform,
  {},
  `Vue.createApp({ render: () => h(App) });`,
  `Vue.createApp(App);`,
  'Can recognize Vue.createApp'
)

defineInlineTest(
  transform,
  {},
  `createApp({ render() { return h(App) } });`,
  `createApp(App);`,
  'remove trivial object method render'
)

defineInlineTest(
  transform,
  {},
  `createApp({ render: () => { return h(App) } });`,
  `createApp(App);`,
  'remove trivial arrow function render with a block statement'
)

defineInlineTest(
  transform,
  {},
  `createApp({ render: () => h(App), data() { return { a: 1 } } });`,
  `createApp({ render: () => h(App), data() { return { a: 1 } } });`,
  'do not touch non-trivial root components'
)
