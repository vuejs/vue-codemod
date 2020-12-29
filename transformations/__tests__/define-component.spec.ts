jest.autoMockOff()

import * as fs from 'fs'
import * as path from 'path'
import { defineInlineTest } from 'jscodeshift/src/testUtils'
import runTransformation from '../../src/runTransformation'

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
  `import { defineComponent } from "vue";
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
  `import { defineComponent } from "@vue/composition-api";
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

const runTest = (
  description: string,
  transformationName: string,
  fixtureName: string,
  extension: string = 'vue'
) => {
  test(description, () => {
    const fixtureDir = path.resolve(
      __dirname,
      '../__testfixtures__',
      transformationName
    )
    const inputPath = path.resolve(
      fixtureDir,
      `${fixtureName}.input.${extension}`
    )
    const outputPath = path.resolve(
      fixtureDir,
      `${fixtureName}.output.${extension}`
    )

    const fileInfo = {
      path: inputPath,
      source: fs.readFileSync(inputPath).toString(),
    }
    const transformation = require(`../${transformationName}`)

    expect(runTransformation(fileInfo, transformation)).toEqual(
      fs.readFileSync(outputPath).toString()
    )
  })
}

runTest(
  'do not touch .vue files which already use defineComponent',
  'define-component',
  'export-define-component'
)

runTest(
  'default exported objects in .vue files should be wrapped with a defineComponent call',
  'define-component',
  'export-object'
)

runTest(
  'Vue.extend in .vue files should be transformed',
  'define-component',
  'export-vue-extend'
)
