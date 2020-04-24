import wrap from '../src/wrap-ast-transformation'
import type { ASTTransformation } from '../src/wrap-ast-transformation'

export const transformAST: ASTTransformation = (context) => {}

export default wrap(transformAST)
export const parser = 'babylon'
