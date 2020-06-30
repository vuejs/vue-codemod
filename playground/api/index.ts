import Koa from 'koa'
import { router } from './router'
import json from 'koa-json'

const app = new Koa()
const API_PORT = process.env.API_PORT || process.env.PORT || 3002

app
  .use(json())
  .use(router.routes())
  .use(router.allowedMethods());

console.log(`Vue Codemode Playground API Started at http://localhost:${API_PORT}`)
app.listen(API_PORT)
