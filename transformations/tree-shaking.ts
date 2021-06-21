import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { transformAST as nextTick } from './next-tick'
import { transformAST as observable } from './observable'
import { transformAST as version } from './version'
import { transformAST as removeImport } from './remove-extraneous-import'

export const transformAST: ASTTransformation = context => {
  nextTick(context)
  observable(context)
  version(context)

  // remove import 'Vue' from 'vue' if not used
  removeImport(context, { localBinding: 'Vue' })
}

export default wrap(transformAST)
export const parser = 'babylon'
