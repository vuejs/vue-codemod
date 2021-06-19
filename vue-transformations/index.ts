import type VueTransformation from '../src/VueTransformation'

type VueTransformationModule = {
  default: VueTransformation
}

const transformationMap: {
  [name: string]: VueTransformationModule
} = {
  'slot-attribute': require('./slot-attribute'),
  'slot-default': require('./slot-default'),
  'slot-scope-attribute': require('./slot-scope-attribute'),
  'v-for-template-key': require('./v-for-template-key'),
  'v-else-if-key': require('./v-else-if-key'),
  'transition-group-root': require('./transition-group-root'),
  'v-bind-order-sensitive': require('./v-bind-order-sensitive'),
  'v-for-v-if-precedence-changed': require('./v-for-v-if-precedence-changed'),
  'remove-listeners': require('./remove-listeners')
}

export default transformationMap
