import type VueTransformation from '../src/VueTransformation'

type VueTransformationModule = {
  default: VueTransformation
}

const transformationMap: {
  [name: string]: VueTransformationModule
} = {
  'slot-attribute': require('./slot-attribute'),
  'slot-default': require('./slot-default'),
  'v-for-template-key': require('./v-for-template-key'),
  'v-else-if-key': require('./v-else-if-key'),
  'transition-group-root': require('./transition-group-root'),
  'v-bind-order-sensitive': require('./v-bind-order-sensitive.spec'),
  'v-for-v-if-precedence-changed': require('./v-for-v-if-precedence-changed')
}

export default transformationMap
