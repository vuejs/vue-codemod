import jscodeshift, { Transform, Parser } from 'jscodeshift'
// @ts-ignore
import getParser from 'jscodeshift/src/getParser'
import { parse } from '@vue/compiler-sfc'
import descriptorToString from 'vue-sfc-descriptor-to-string'
import createDebug from 'debug'

import VueTransformation from './VueTransformation'

const debug = createDebug('vue-codemod')

type FileInfo = {
  path: string
  source: string
}

type JSTransformation = Transform & {
  parser?: string | Parser
}

type JSTransformationModule =
  | JSTransformation
  | {
      default: Transform
      parser?: string | Parser
    }

type VueTransformationModule =
  | VueTransformation
  | {
      default: VueTransformation
    }

type TransformationModule = JSTransformationModule | VueTransformationModule

export default function runTransformation(
  fileInfo: FileInfo,
  transformationModule: TransformationModule,
  params: object = {}
) {
  let transformation: VueTransformation | JSTransformation
  // @ts-ignore
  if (typeof transformationModule.default !== 'undefined') {
    // @ts-ignore
    transformation = transformationModule.default
  } else {
    transformation = transformationModule
  }

  if (transformation instanceof VueTransformation) {
    debug('TODO: Running VueTransformation')
    return
  }

  debug('Running jscodeshift transform')

  let parser = getParser()
  const parserOption = (transformationModule as JSTransformationModule).parser
  if (parserOption) {
    parser =
      typeof parserOption === 'string' ? getParser(parserOption) : parserOption
  }
  const j = jscodeshift.withParser(parser)
  const api = {
    j,
    jscodeshift: j,
    stats: () => {},
    report: () => {},
  }

  const { path, source } = fileInfo
  const extension = (/\.([^.]*)$/.exec(path) || [])[0]

  if (extension !== '.vue') {
    const out = transformation(fileInfo, api, params)
    if (!out) {
      return source // skipped
    }
    return out
  }

  const { descriptor } = parse(source, { filename: path })
  if (descriptor.script) {
    fileInfo.source = descriptor.script.content
    const out = transformation(fileInfo, api, params)

    if (!out || out === descriptor.script.content) {
      return source // skipped
    }
    descriptor.script.content = out
    return descriptorToString(descriptor, {
      indents: {
        template: 0,
      },
    })
  }

  return source
}
