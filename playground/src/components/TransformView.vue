<template>
  <Panels>
    <template v-slot:left>
      <Editor v-model:value="input" title="Input" mode="text/x-vue">
        <template v-slot:actions>
          <button
            @click="run"
            class="bg-transparent text-xs text-gray-500 hover:text-gray-600 border border-gray-400 hover:border-gray-600 px-2 rounded align-middle"
          >Run</button>
        </template>
      </Editor>
    </template>
    <template v-slot:right>
      <Editor v-model:value="output" title="Output" readonly mode='text/x-vue'/>
    </template>
  </Panels>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { store } from '../store'
import { VueTemplate } from '../templates'

export default defineComponent({
  setup() {
    const input = ref(VueTemplate)
    const output = ref('')

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
      } catch (e) {
        console.error(e)
        output.value = e.toString()
      }
    }

    return {
      output,
      input,
      run,
    }
  },
})
</script>
