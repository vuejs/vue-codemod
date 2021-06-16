import jscodeshift, { Transform, Parser } from 'jscodeshift'
// @ts-ignore
import getParser from 'jscodeshift/src/getParser'
import createDebug from 'debug'

import { parse as parseSFC, stringify as stringifySFC } from './sfcUtils'
import type { SFCDescriptor } from './sfcUtils'

import VueTransformation from './VueTransformation'

const debug = createDebug('vue-codemod')

type FileInfo = {
  path: string
  source: string
}

type JSTransformation = Transform & {
  type: 'JSTransformation'
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
      default: VueTransformation,
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
    // @ts-ignore
    transformation = transformationModule
  }

  const { path, source } = fileInfo
  const extension = (/\.([^.]*)$/.exec(path) || [])[0]
  let lang = extension.slice(1)
  let descriptor: SFCDescriptor

  if (transformation.type === 'vueTransformation' && extension === '.vue') {
    debug('Running VueTransformation')

    descriptor = parseSFC(source, { filename: path }).descriptor

    // skip .vue files without template block
    if (!descriptor.template) {
      return source
    }
    let contentStart: number =
      descriptor.template.ast.children[0].loc.start.offset
    let contentEnd: number =
      descriptor.template.ast.children[
        descriptor.template.ast.children.length - 1
      ].loc.end.offset + 1

    fileInfo.source =
      source.slice(0, contentStart) +
      descriptor.template.content +
      source.slice(contentEnd)

    const out = transformation(fileInfo, params)

    if (!out) {
      return source
    }

    // need to reconstruct the .vue file from descriptor blocks
    if (extension === '.vue') {
      if (out === descriptor!.template!.content) {
        return source // skipped, don't bother re-stringifying
      }
      // remove redundant <template> tag
      descriptor!.template!.content = out.slice(
        contentStart,
        descriptor.template.content.length - contentEnd
      )
      return stringifySFC(descriptor!)
    }

    return out
  } else {
    debug('Running jscodeshift transform')

    if (extension === '.vue') {
      descriptor = parseSFC(source, { filename: path }).descriptor

      // skip .vue files without script block
      if (!descriptor.script) {
        return source
      }

      lang = descriptor.script.lang || 'js'
      fileInfo.source = descriptor.script.content
    }

    let parser = getParser()
    let parserOption = (transformationModule as JSTransformationModule).parser
    // force inject `parser` option for .tsx? files, unless the module specifies a custom implementation
    if (typeof parserOption !== 'object') {
      if (lang.startsWith('ts')) {
        parserOption = lang
      }
    }

    if (parserOption) {
      parser =
        typeof parserOption === 'string'
          ? getParser(parserOption)
          : parserOption
    }

    const j = jscodeshift.withParser(parser)
    const api = {
      j,
      jscodeshift: j,
      stats: () => {},
      report: () => {},
    }

    const out = transformation(fileInfo, api, params)
    if (!out) {
      return source // skipped
    }

    // need to reconstruct the .vue file from descriptor blocks
    if (extension === '.vue') {
      if (out === descriptor!.script!.content) {
        return source // skipped, don't bother re-stringifying
      }

      descriptor!.script!.content = out
      return stringifySFC(descriptor!)
    }

    return out
  }
}
