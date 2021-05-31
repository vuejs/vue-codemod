import { defineInlineTest } from 'jscodeshift/src/testUtils'
const transform = require('../add-emit-declaration')

defineInlineTest(
  transform,
  {},
  `export default {
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  `export default {
  emits: ["increment", "decrement"],
  props: ['text'],

  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
};`,
  'add emit declaration'
)

defineInlineTest(
  transform,
  {},
  `export default {
  emits: [],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  `export default {
  emits: ["increment", "decrement"],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  'add emit declaration(has emits property but empty)'
)

defineInlineTest(
  transform,
  {},
  `export default {
  emits: ['increment'],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}
`,
  `export default {
  emits: ['increment', "decrement"],
  props: ['text'],
  methods: {
    input: function() {
      this.$emit('increment')
      this.$emit('decrement')
    }
  }
}`,
  'add emit declaration(has emits property and not empty)'
)
