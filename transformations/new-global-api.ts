import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

export const transformAST: ASTTransformation = ({ root, j }) => {}

export default wrap(transformAST)
export const parser = 'babylon'
