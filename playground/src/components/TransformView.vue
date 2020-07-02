<template>
  <Panels>
    <template v-slot:left>
      <Editor v-model:value="input" title="Input" mode="text/x-vue">
        <template v-slot:actions>
          <button @click="run" class="btn-icon text-lg">
            <span class="iconify" data-icon="ri:refresh-line" data-inline="false"></span>
          </button>
        </template>
      </Editor>
    </template>

    <template v-slot:right>
      <Editor v-model:value="output" title="Output" readonly mode="text/x-vue">
        <template v-slot:actions>
          <div class="text-sm mr-1 m-auto text-gray-500">{{lastUpdate}}</div>
          <div class="text-lg p-1 m-auto">
            <span class="iconify" data-icon="logos:vue" data-inline="false"></span>
          </div>
        </template>
      </Editor>
    </template>
  </Panels>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { store } from '../store'
import { VueTemplate } from '../templates'
import { useFileWatcher } from '../watcher'

export default defineComponent({
  setup() {
    const input = ref(VueTemplate)
    const output = ref('')
    const lastUpdate = ref('')

    const run = async () => {
      try {
        const r = await fetch(`/api/run/${store.current}`, {
          method: 'POST',
          body: input.value,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
        output.value = await r.text()
        lastUpdate.value = new Date().toLocaleTimeString()
      } catch (e) {
        console.error(e)
        output.value = e.toString()
      }
    }

    watch(() => store.current, run)

    useFileWatcher((e) => {
      console.log(e)
      if (store.current && e.path.startsWith(store.current)) {
        console.log('RUN')
        run()
      }
    })

    return {
      output,
      input,
      run,
      lastUpdate,
    }
  },
})
</script>
