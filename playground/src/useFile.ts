import { ref, onUnmounted } from "vue";
import { store } from "./store";

export function useFile(filepath: string, defaultContent: string) {
  let content = ref(defaultContent)
  let isReady = ref(false)

  const ws = new WebSocket(`ws://localhost:${store.apiPort}/watch/${filepath}`)

  ws.addEventListener('message', (e)=>{
    console.log('WS', e)
  })

  const send = (v:any)=> {
    ws.send(JSON.stringify(v))
  }

  const save = (v: string) => {
    send({
      event: 'save',
      content: v
    })
  }

  const destory = () => {
    if (ws.readyState !== ws.CLOSED)
      ws.close()
  }

  onUnmounted(destory)

  return {
    ws,
    content,
    isReady,
    filepath,
    save,
    destory
  }
}
