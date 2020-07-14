import { reactive } from 'vue'

// http://localhost:3000/api/meta
export const store = reactive({
  current: '',
  apiPort: 3002,
  rootPath: '',
  transformations: [],
  fixtures: {} as Record<string, string[]>,
  config: {
    vscodeInsiders: false,
  },
})

export function initStore() {
  return fetch('/api/meta')
    .then((r) => r.json())
    .then((r) => {
      Object.assign(store, r)
      if (!store.current) store.current = 'define-component'
    })
}
