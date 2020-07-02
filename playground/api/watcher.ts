import WebSocket from 'ws'
import { server } from './app'
import chokidar from 'chokidar'
import { TRANS_DIR } from './constants'
import path from 'path'

const wss = new WebSocket.Server({ server })

const clients: WebSocket[] = []

wss.on('connection', (ws) => {
  clients.push(ws)
  ws.on('close', () => {
    clients.splice(clients.indexOf(ws), 1)
  })
})

chokidar.watch(TRANS_DIR, {ignoreInitial: true}).on('all', (event, filepath) => {
  const relative = path.relative(TRANS_DIR, filepath)
  console.log(event, relative)
  clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        event,
        path: relative,
      })
    )
  })
})
