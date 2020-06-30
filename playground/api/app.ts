import Koa from 'koa'
import http from 'http'
import { router } from './router'
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'
import error from 'koa-error'

const app = new Koa()
const server = http.createServer(app.callback())

app
  .use(error())
  .use(bodyParser())
  .use(json())
  .use(router.routes())
  .use(router.allowedMethods())

export {
  app,
  server
}
