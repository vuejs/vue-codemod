import type { Transform } from 'jscodeshift'
import { getVueOptions } from '../astUtils'

import { defineInlineTest } from 'jscodeshift/src/testUtils'

const printVueOptions: Transform = function (
  file,
  api,
  { filename = 'test.js' }: { filename?: string } = {}
) {
  const j = api.jscodeshift
  const root = j(file.source)
  const context = { root, j, filename }

  const options = getVueOptions(context)

  if (!options.length) {
    return ''
  }

  const result = options.toSource({ lineTerminator: '\n' })

  if (Array.isArray(result)) {
    return result.map((source, index) => `${index}: ${source}`).join('\n\n')
  }

  return result
}

// @ts-ignore
printVueOptions.parser = 'babylon'

defineInlineTest(
  printVueOptions,
  { filename: 'test.vue' },
  `export default {
    data () {
      return { foo: 1 }
    }
  }`,
  `{
    data () {
      return { foo: 1 }
    }
}`,
  'should print default object export from a .vue file'
)

defineInlineTest(
  printVueOptions,
  { filename: 'test.vue' },
  `const obj = {
    data () {
      return { foo: 1 }
    }
  }
  export default obj`,
  `{
    data () {
      return { foo: 1 }
    }
  }`,
  'should print default variable export from a .vue file if it is actually an object'
)

// TODO: a `var` that is never re-assigned

defineInlineTest(
  printVueOptions,
  {},
  `export default {
    data () {
      return { foo: 1 }
    },
    template: '<div>foo: {foo}</div>'
  }`,
  `{
    data () {
      return { foo: 1 }
    },

    template: '<div>foo: {foo}</div>'
}`,
  'should recognize the default export from a .js file, if it is an object and contains a `template` property'
)

defineInlineTest(
  printVueOptions,
  {},
  `const obj = {
    data () {
      return { foo: 1 }
    },
    template: '<div>foo: {foo}</div>'
  }
  export default obj`,
  `{
    data () {
      return { foo: 1 }
    },
    template: '<div>foo: {foo}</div>'
  }`,
  'should recognize the default export from a .js file, if it is a const object and was initially assigned a `template` property'
)

defineInlineTest(
  printVueOptions,
  {},
  `var obj = {
    data () {
      return { foo: 1 }
    },
    template: '<div>foo: {foo}</div>'
  }
  obj = {}
  export default obj`,
  '',
  'should ignore the default export from a .js file, if it is ever reassigned'
)

defineInlineTest(
  printVueOptions,
  {},
  `export default {
    data () {
      return { foo: 1 }
    },
    render(h) {
      return h("div", ["foo: ", this.foo]);
    }
  }`,
  `{
    data () {
      return { foo: 1 }
    },

    render(h) {
      return h("div", ["foo: ", this.foo]);
    }
}`,
  'should recognize the default export from a .js file, if it is an object and contains a `render` property'
)

defineInlineTest(
  printVueOptions,
  {},
  `export default { foo: 1 }`,
  '',
  'should ignore the default export from a .js file, if it is an object but has neither a `render` property or a `template` property'
)

defineInlineTest(
  printVueOptions,
  {},
  `new Vue({
    template: '#my-component',
    data() { return { foo: 1 } }
  })`,
  `{
    template: '#my-component',
    data() { return { foo: 1 } }
  }`,
  'should recognize the argument of a `new Vue` call'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component('my-component', {
    template: '#my-component',
    data() { return { foo: 1 } }
  })`,
  `{
    template: '#my-component',
    data() { return { foo: 1 } }
  }`,
  'should recognize the argument of a `Vue.component` call'
)

defineInlineTest(
  printVueOptions,
  { filename: 'test.vue' },
  `export default {
    components: {
      PropagateDisable: {
        mixins: [
          DisabledParent,
        ],

        render (h) {
          return h('div', { staticClass: 'vue-ui-disable' }, this.$scopedSlots.default())
        }
      }
    },

    data () {
      return { foo: 1 }
    }
  }`,
  `0: {
    components: {
      PropagateDisable: {
        mixins: [
          DisabledParent,
        ],

        render (h) {
          return h('div', { staticClass: 'vue-ui-disable' }, this.$scopedSlots.default())
        }
      }
    },

    data () {
      return { foo: 1 }
    }
}

1: {
  mixins: [
    DisabledParent,
  ],

  render (h) {
    return h('div', { staticClass: 'vue-ui-disable' }, this.$scopedSlots.default())
  }
}`,
  'should recognize inline components via the `components` property'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    () => import('./my-async-component')
  )
  `,
  `() => import('./my-async-component')`,
  'should recognize simple async components'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    () => (111, import('./my-async-component'))
  )
  `,
  `() => (111, import('./my-async-component'))`,
  'should recognize async components with a comma expression'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    () => { return import('./my-async-component') }
  )
  `,
  `() => { return import('./my-async-component') }`,
  'should recognize the async component as a arrow function with a function body'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    function () { return import('./my-async-component') }
  )
  `,
  `function () { return import('./my-async-component') }`,
  'should recognize the async component as a function with a function body'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    async function () { const componentName = await apiCall(); return await customLoad(componentName); }
  )
  `,
  `async function () { const componentName = await apiCall(); return await customLoad(componentName); }`,
  'should recognize the async component as an async function'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    async () => await customLoad('./example.vue')
  )
  `,
  `async () => await customLoad('./example.vue')`,
  'should recognize the async component as an async arrow function'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component('async-example', function () {
    return new Promise(resolve => resolve({
      template: '<div>I am async!</div>'
    }))
  })
  `,
  `function () {
    return new Promise(resolve => resolve({
      template: '<div>I am async!</div>'
    }))
  }`,
  'should recognize the async component as a function returning a new Promise'
)

defineInlineTest(
  printVueOptions,
  {},
  `Vue.component(
    'async-webpack-example',
    function() {
      if (a) {
        return import('./A.vue')
      }
      return import('./my-async-component')
    }
  )`,
  `function() {
  if (a) {
    return import('./A.vue')
  }
  return import('./my-async-component')
}`,
  'should recognize async component function with more than one return statements'
)

defineInlineTest(
  printVueOptions,
  { filename: 'test.vue' },
  `export default {
    components: {
      AsyncExample: () => import('./async-example.vue')
    },

    data () {
      return { foo: 1 }
    }
  }`,
  `0: {
    components: {
      AsyncExample: () => import('./async-example.vue')
    },

    data () {
      return { foo: 1 }
    }
}

1: () => import('./async-example.vue')`,
  'should recognize inline async components via the `components` property'
)

// Vue.component(
//   'async-webpack-example',
//   () => { return (111, import('./my-async-component')) }
// )

// Vue.component('async-example', function (resolve, reject) {
//   setTimeout(function () {
//     resolve({
//       template: '<div>I am async!</div>'
//     })
//   }, 1000)
// })
