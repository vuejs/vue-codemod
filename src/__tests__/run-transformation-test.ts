/* eslint-env jest */
import type { Transform } from 'jscodeshift'
import runTransformation from '../run-transformation'
import addUseStrict from './add-use-strict'

const unreachableTransform: Transform = () => {
  throw new Error('This transform should never be invoked')
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
