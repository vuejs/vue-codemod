import { reactive } from 'vue'

export const store = reactive({
  current: '',
  rootPath: '',
  transformations: [],
  config: {
    vscodeInsiders: true
  }
})

export function initStore() {
  fetch('/api/transformations')
    .then(r => r.json())
    .then(r => {
      store.transformations = r
      if (!store.current)
        store.current = r[0]
    })

  fetch('/api/root')
    .then(r => r.text())
    .then(r => {
      store.rootPath = r
    })
}
