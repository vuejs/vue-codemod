import * as operationUtils from '../operationUtils'

describe('run-operationUtils', () => {
  const node: any = { range: [54, 106] }
  const start: number = 100
  const end: number = 101
  const rangeAt: number = 1000
  const modifyText: string = 'Change Code'
  const blankTest: string = ''

  it('insertTextAfter code to equal object', () => {
    expect(operationUtils.insertTextAfter(node, modifyText)).toStrictEqual({
      range: [node.range[1], node.range[1]],
      text: modifyText,
    })
  })

  it('insertTextAfterRange code to equal object', () => {
    expect(
      operationUtils.insertTextAfterRange([start, end], modifyText)
    ).toStrictEqual({ range: [end, end], text: modifyText })
  })

  it('insertTextAt code to equal object', () => {
    expect(operationUtils.insertTextAt(rangeAt, modifyText)).toStrictEqual({
      range: [rangeAt, rangeAt],
      text: modifyText,
    })
  })

  it('insertTextBefore code to equal object', () => {
    expect(operationUtils.insertTextBefore(node, modifyText)).toStrictEqual({
      range: [node.range[0], node.range[0]],
      text: modifyText,
    })
  })

  it('insertTextBeforeRange code to equal object', () => {
    expect(
      operationUtils.insertTextBeforeRange([start, end], modifyText)
    ).toStrictEqual({ range: [start, start], text: modifyText })
  })

  it('remove code to equal object', () => {
    expect(operationUtils.remove(node)).toStrictEqual({
      range: node.range,
      text: blankTest,
    })
  })

  it('removeRange code to equal object', () => {
    expect(operationUtils.removeRange([start, end])).toStrictEqual({
      range: [start, end],
      text: blankTest,
    })
  })

  it('replaceText code to equal object', () => {
    expect(operationUtils.replaceText(node, modifyText)).toStrictEqual({
      range: node.range,
      text: modifyText,
    })
  })

  it('replaceTextRange code to equal object', () => {
    expect(
      operationUtils.replaceTextRange(node.range, modifyText)
    ).toStrictEqual({ range: node.range, text: modifyText })
  })
})
