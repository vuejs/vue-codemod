import fg from 'fast-glob'
import { TRANS_DIR, API_PORT, ROOT_DIR } from './constants'
import path from 'path'

export async function getTransformations() {
  const files = await fg('*.ts', {
    cwd: TRANS_DIR,
    onlyFiles: true,
  })

  // remove .ts extension and filter out index.ts
  return files.map((f) => f.slice(0, -3)).filter((f) => f !== 'index')
}

export async function getMeta() {
  const transformations = await getTransformations()

  const fixtures: any = {}

  for (const t of transformations) {
    const files = await fg('*.{vue,ts,js}', {
      cwd: path.join(TRANS_DIR, '__testfixtures__', t),
      onlyFiles: true,
    })

    if (files.length) {
      fixtures[t] = files
    }
  }

  return {
    apiPort: API_PORT,
    rootPath: ROOT_DIR,
    transformations,
    fixtures,
  }
}
