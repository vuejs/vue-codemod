import Koa from 'koa'
import { router } from './router'
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'
// @ts-ignore
import error from 'koa-error'

const app = new Koa()
const API_PORT = process.env.API_PORT || process.env.PORT || 3002

app
  .use(error())
  .use(bodyParser())
  .use(json())
  .use(router.routes())
  .use(router.allowedMethods());

console.log(`Vue Codemode Playground API Started at http://localhost:${API_PORT}`)
app.listen(API_PORT)
