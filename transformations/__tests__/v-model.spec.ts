import { defineInlineTest } from 'jscodeshift/src/testUtils'

const transform = require('../v-model')

defineInlineTest(
  transform,
  {},
  `export default {
  props: {
    title: String,
    value: String
  },
  model: {
    prop: 'title',
    event: 'update'
  },
  emits: ['update:modelValue'],
  methods: {
    changePageTitle(title) {
      this.$emit('update:modelValue', title)
    }
  }
}`,
  `export default {
  props: {
    modelValue: String,
    value: String
  },

  emits: ['update:modelValue'],

  methods: {
    changePageTitle(title) {
      this.$emit('update:modelValue', title)
    },

    updateTitle (title){
      this.$emit('update:modelValue', title)
    }
  }
};`,
  'transformation v-mode'
)


defineInlineTest(
  transform,
  {},
  `export default {
  props: {
    value: String,
    title: String
  },
  model: {
    prop: 'title',
    event: 'change'
  },
  emits: ['update:modelValue']
}`,
  `export default {
  props: {
    value: String,
    modelValue: String
  },
  emits: ['update:modelValue'],
  methods: {
    changeTitle (title){
      this.$emit('update:modelValue', title)
    }
  }
}`,
  'transformation v-mode no methods option'
)

defineInlineTest(
  transform,
  {},
  `export default {
  props: {
    title: String
  },
  model: {
    prop: 'title',
    event: 'change'
  },
  emits: ['update:modelValue'],
  methods: {
    change(param){
      this.$emit('change',param)
    }
  }
}`,
  `export default {
  props: {
    modelValue: String
  },

  emits: ['update:modelValue'],

  methods: {
    change(param){
      changeTitle(param);
    },

    changeTitle (title){
      this.$emit('update:modelValue', title)
    }
  }
};`,
  'transformation v-mode with a method call'
)
