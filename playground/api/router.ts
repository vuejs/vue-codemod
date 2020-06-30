import Router from '@koa/router'
import path from 'path'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { default as runTransformation } from '../../src/run-transformation'

const router = new Router()
const ROOT_DIR = path.resolve(__dirname, '../..')
const TRANS_DIR = path.resolve(ROOT_DIR, 'transformations')

router.get('/', (ctx) => {
  ctx.body = 'Hello'
})

router.get('/root', (ctx) => {
  ctx.body = ROOT_DIR
})

router.get('/transformations', async (ctx) => {
  const files = await fg('*.ts', {
    cwd: TRANS_DIR,
    onlyFiles: true
  })

  // remove .ts extension and filter out index.ts
  ctx.body = files
    .map(f => f.slice(0, -3))
    .filter(f => f !== 'index')
})

router.get('/files/(.*)', async (ctx) => {
  const filepath = path.join(ROOT_DIR, ctx.params[0])
  if (fs.existsSync(filepath))
    ctx.body = await fs.readFile(filepath, 'utf-8')
  else
    ctx.status = 404
})

router.put('/files/(.*)', async (ctx) => {
  const filepath = path.join(ROOT_DIR, ctx.params[0])
  await fs.writeFile(filepath, ctx.request.body, 'utf-8')
})

router.get('/run/:trans', async (ctx) => {
  const transformationModule = require(`../../transformations/${ctx.params.trans}.ts`)

  ctx.body = runTransformation(
    {
      path: 'anonymous.vue',
      source: ctx.request.body || ''
    },
    transformationModule
  )
})

export { router }
