// @ts-nocheck
/* eslint-env jest */
import type { Transform } from 'jscodeshift'
import runTransformation from '../runTransformation'

const unreachableTransform: Transform = () => {
  throw new Error('This transform should never be invoked')
}

const addUseStrict: Transform = (file, api, options) => {
  const j = api.jscodeshift

  const hasStrictMode = (body) =>
    body.some((statement) =>
      j.match(statement, {
        type: 'ExpressionStatement',
        expression: {
          type: 'Literal',
          value: 'use strict',
        },
      })
    )

  const withComments = (to, from) => {
    to.comments = from.comments
    return to
  }

  const createUseStrictExpression = () =>
    j.expressionStatement(j.literal('use strict'))

  const root = j(file.source)
  const body = root.get().value.program.body
  if (!body.length || hasStrictMode(body)) {
    return null
  }

  body.unshift(withComments(createUseStrictExpression(), body[0]))
  body[0].comments = body[1].comments
  delete body[1].comments

  return root.toSource(options.printOptions || { quote: 'single' })
}

describe('run-transformation', () => {
  it('transforms .js files', () => {
    const source = `function a() { console.log('hello') }`
    const file = { path: '/tmp/a.js', source }
    const result = runTransformation(file, addUseStrict)
    expect(result).toBe(`'use strict';\nfunction a() { console.log('hello') }`)
  })

  it.todo('transforms .ts files')

  it('transforms script blocks in .vue files', () => {
    const source = `<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>
<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld
  }
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
`
    const file = { path: '/tmp/a.vue', source }
    const result = runTransformation(file, addUseStrict)
    expect(result).toBe(`<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>
<script>
'use strict';
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld
  }
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
`)
  })

  it.todo('transforms script blocks with custom lang attributes in .vue files')

  it('(jscodeshift transforms) skips .vue files without script blocks', () => {
    const source = `
      <template>
        <div id="app">
          <img alt="Vue logo" src="./assets/logo.png">
          <HelloWorld msg="Welcome to Your Vue.js App"/>
        </div>
      </template>

      <style>
      #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
      }
      </style>`
    const result = runTransformation(
      {
        path: '/tmp/hello.vue',
        source,
      },
      unreachableTransform
    )

    expect(result).toEqual(source)
  })

  it.todo('(VueTransformation) transforms template blocks in .vue files')
})
