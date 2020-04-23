// @ts-nocheck
export default function (file, api, options) {
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
