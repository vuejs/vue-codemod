/**
 * Adapted from https://github.com/psalaets/vue-sfc-descriptor-to-string/blob/master/index.js
 */

/**
 * The MIT License (MIT)
 * Copyright (c) 2018 Paul Salaets
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import type { SFCDescriptor, SFCBlock } from '@vue/compiler-sfc'

export default function stringify(sfcDescriptor: SFCDescriptor) {
  const { template, script, styles, customBlocks } = sfcDescriptor

  return (
    ([template, script, ...styles, ...customBlocks]
      // discard blocks that don't exist
      .filter((block) => block != null) as Array<NonNullable<SFCBlock>>)
      // sort blocks by source position
      .sort((a, b) => a.loc.start.offset - b.loc.start.offset)
      // figure out exact source positions of blocks
      .map((block) => {
        const openTag = makeOpenTag(block)
        const closeTag = makeCloseTag(block)

        return Object.assign({}, block, {
          openTag,
          closeTag,

          startOfOpenTag: block.loc.start.offset - openTag.length,
          endOfOpenTag: block.loc.start.offset,

          startOfCloseTag: block.loc.end.offset,
          endOfCloseTag: block.loc.end.offset + closeTag.length,
        })
      })
      // generate sfc source
      .reduce((sfcCode, block, index, array) => {
        const first = index === 0

        let newlinesBefore = 0

        if (first) {
          newlinesBefore = block.startOfOpenTag
        } else {
          const prevBlock = array[index - 1]
          newlinesBefore = block.startOfOpenTag - prevBlock.endOfCloseTag
        }

        return (
          sfcCode +
          '\n'.repeat(newlinesBefore) +
          block.openTag +
          block.content +
          block.closeTag
        )
      }, '')
  )
}

function makeOpenTag(block: SFCBlock) {
  let source = '<' + block.type

  source += Object.keys(block.attrs)
    .sort()
    .map((name) => {
      const value = block.attrs[name]

      if (value === true) {
        return name
      } else {
        return `${name}="${value}"`
      }
    })
    .map((attr) => ' ' + attr)
    .join('')

  return source + '>'
}

function makeCloseTag(block: SFCBlock) {
  return `</${block.type}>\n`
}
