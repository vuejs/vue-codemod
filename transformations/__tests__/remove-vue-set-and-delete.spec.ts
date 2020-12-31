import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../remove-vue-set-and-delete')

defineInlineTest(
  transform,
  {},
  `Vue.set(vm.someObject, 'b', 2);`,
  `vm.someObject['b'] = 2;`,
  'Remove Vue.set'
)

defineInlineTest(
  transform,
  {},
  `export default {
    methods: {
      modify() {
        this.$set(this.someObject, 'b', 2);
      }
    }
  };`,
  `export default {
    methods: {
      modify() {
        this.someObject['b'] = 2;
      }
    }
  };`,
  'Remove this.$set'
)

defineInlineTest(
  transform,
  {},
  `export default {
    created () {
      const vm = this;
      this.$on('some-event', function () {
        vm.$set(vm.someObject, 'b', 2);
      })
    }
  };`,
  `export default {
    created () {
      const vm = this;
      this.$on('some-event', function () {
        vm.someObject['b'] = 2;
      })
    }
  };`,
  'Remove vm.$set when vm is an alias to this'
)

defineInlineTest(
  transform,
  {},
  `export default {
    created () {
      var vm = this;
      vm = { $set: () => {} }
      this.$on('some-event', function () {
        vm.$set(vm.someObject, 'b', 2);
      })
    }
  };`,
  `export default {
    created () {
      var vm = this;
      vm = { $set: () => {} }
      this.$on('some-event', function () {
        vm.$set(vm.someObject, 'b', 2);
      })
    }
  };`,
  `Don't remove vm.$set when we are not sure if vm is an alias to this`
)

defineInlineTest(
  transform,
  {},
  `value.$set('a', 1)`,
  `value.$set('a', 1)`,
  `don't remove random .$set functions`
)

// TODO: delete
