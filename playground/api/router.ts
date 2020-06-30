import Router from '@koa/router'
import path from 'path'
import fg from 'fast-glob'

const router = new Router()
const ROOT_DIR = path.resolve(__dirname, '../..')
const TRANS_DIR = path.resolve(ROOT_DIR, 'transformations')

router.get('/', (ctx) => {
  ctx.body = 'Hello'
})

router.get('/transformations', async (ctx) => {
  const files = await fg('*.ts', {
    cwd: TRANS_DIR,
    onlyFiles: true
  })

  // remove .ts extension
  ctx.body = files.map(f => f.slice(0, -3))
})

export { router }
