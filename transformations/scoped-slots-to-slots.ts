import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'

import type * as N from 'jscodeshift'

export const transformAST: ASTTransformation = ({ j, root }) => {
  const dotScopedSlots = root.find(j.MemberExpression, {
    property: {
      type: 'Identifier',
      name: '$scopedSlots',
    },
  })
  dotScopedSlots.forEach(({ node }) => {
    ;(node.property as N.Identifier).name = '$slots'
  })

  const squareBracketScopedSlots = root.find(j.MemberExpression, {
    property: {
      type: 'StringLiteral',
      value: '$scopedSlots',
    },
  })
  squareBracketScopedSlots.forEach(({ node }) => {
    node.property = j.stringLiteral('$slots')
  })
}

export default wrap(transformAST)
export const parser = 'babylon'
