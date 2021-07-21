import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../render-to-resolveComponent')

defineInlineTest(
  transform,
  {},
  `export default {
  render(h){
    return h('button-counter')
  }
}`,
  `
import { resolveComponent } from "vue";
export default {
  render() {
    const buttonCounter = resolveComponent('button-counter')
    return buttonCounter;
  }
}`,
  'transform render-to-resolveComponent'
)
