import fg from 'fast-glob'
import { TRANS_DIR } from './constants'

export async function getTransformations() {
  const files = await fg('*.ts', {
    cwd: TRANS_DIR,
    onlyFiles: true,
  })

  // remove .ts extension and filter out index.ts
  return files.map((f) => f.slice(0, -3)).filter((f) => f !== 'index')
}
