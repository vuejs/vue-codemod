import Router from '@koa/router'
import path from 'path'
import fs from 'fs-extra'
import { default as runTransformation } from '../../src/run-transformation'
import { API_PORT, ROOT_DIR } from './constants'
import { getTransformations } from './controllers'

const router = new Router()

router.get('/', (ctx) => {
  ctx.body = 'Hello'
})

router.get('/meta', async (ctx) => {
  ctx.body = {
    apiPort: API_PORT,
    rootPath: ROOT_DIR,
    transformations: await getTransformations()
  }
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

router.post('/run/:trans', async (ctx) => {
  const transformationModule = require(`../../transformations/${ctx.params.trans}.ts`)

  console.log(ctx.request.body)

  const result = runTransformation(
    {
      path: 'anonymous.vue',
      source: ctx.request.body || ''
    },
    transformationModule
  )

  ctx.body = result
})

export { router }
