import type { ArrowFunctionExpression } from 'jscodeshift'

import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

import { transformAST as addImport } from './add-import'

export const transformAST: ASTTransformation = (context) => {
  const { root, j } = context
  const renderFns = root.find(j.ObjectProperty, {
    key: {
      name: 'render',
    },
    value: {
      type: 'ArrowFunctionExpression',
    },
  })

  if (renderFns.length) {
    addImport(context, {
      specifier: { imported: 'h' },
      source: 'vue',
    })

    renderFns.forEach(({ node }) => {
      ;(node.value as ArrowFunctionExpression).params.shift()
    })
  }

  // TODO: render methods
}

export default wrap(transformAST)
export const parser = 'babylon'
