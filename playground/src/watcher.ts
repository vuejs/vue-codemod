import { ref, onUnmounted } from 'vue'
import { store } from './store'

interface Event {
  event: string
  path: string
}

export function useFileWatcher(callback: (e: Event) => void) {
  let isReady = ref(false)
  let ws: WebSocket | undefined

  const connect = () => {
    console.info('Connecting to WS...')
    ws = new WebSocket(`ws://localhost:${store.apiPort}/`)

    ws.addEventListener('message', (e) => {
      const data = JSON.parse(e.data)
      callback(data)
    })

    ws.addEventListener('close', () => {
      ws = undefined
      setTimeout(connect, 1000)
    })
  }

  const send = (v: any) => {
    ws?.send(JSON.stringify(v))
  }

  const destory = () => {
    if (ws?.readyState !== ws?.CLOSED) ws?.close()
  }

  onUnmounted(destory)

  connect()

  return {
    ws,
    send,
    isReady,
    destory,
  }
}
