import WebSocket from 'ws'
import { server } from './app'

const wss = new WebSocket.Server({
  server
})

wss.on('connection', (ws) => {
  console.log(ws.url)
  ws.on('message', (message) => {
      console.log('received: %s', message)
  })
  ws.send('something')
})
