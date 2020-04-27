import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../define-component')

defineInlineTest(
  transform,
  {},
  `import Vue from "vue";
var Profile = Vue.extend({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  `import Vue, { defineComponent } from "vue";
var Profile = defineComponent({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  'transforms Vue.extend to defineComponent'
)

defineInlineTest(
  transform,
  {
    useCompositionApi: true,
  },
  `import Vue from "vue";
var Profile = Vue.extend({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  `import Vue from "vue";
import { defineComponent } from "@vue/composition-api";
var Profile = defineComponent({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: function () {
    return {
      firstName: 'Walter',
      lastName: 'White',
      alias: 'Heisenberg'
    }
  }
})`,
  'imports from @vue/composition-api'
)
