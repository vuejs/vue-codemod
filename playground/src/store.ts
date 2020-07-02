import { reactive } from 'vue'

export const store = reactive({
  current: '',
  apiPort: 3002,
  rootPath: '',
  transformations: [],
  fixtures: {},
  config: {
    vscodeInsiders: true
  }
})

export function initStore() {
  fetch('/api/meta')
    .then(r => r.json())
    .then(r => {
      Object.assign(store, r)
      if (!store.current)
        store.current = store.transformations[0]
    })
}

