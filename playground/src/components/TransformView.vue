<template>
  <Panels>
    <template v-slot:left>
      <Editor
        v-model:value="input"
        v-model:changed="inputChanged"
        @ready="run"
        :filepath="inputPath"
        title="Input"
        mode="text/x-vue"
      >
        <template v-slot:title>
          <FixtureSelect v-model:value="inputFixtureName" type="input" :changed="inputChanged" />
          <button @click="newInput" class="btn-icon text-lg">
            <span class="iconify" data-icon="ri:add-circle-line" data-inline="false"></span>
          </button>
          <button @click="saveInput" class="btn-icon text-lg" :class="{disabled: !inputChanged}">
            <span class="iconify" data-icon="ri:save-line" data-inline="false"></span>
          </button>
        </template>
        <template v-slot:actions>
          <button @click="run" class="btn-icon text-lg">
            <span class="iconify" data-icon="ri:play-line" data-inline="false"></span>
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
import { defineComponent, ref, watch, computed } from 'vue'
import { store } from '../store'
import { VueTemplate } from '../templates'
import { useFileWatcher } from '../watcher'
import { getFixturePath } from '../utils'

export default defineComponent({
  setup() {
    const input = ref(VueTemplate)
    const output = ref('')
    const lastUpdate = ref('')
    const inputChanged = ref(false)
    const inputFixtureName = ref('')
    const inputPath = ref('')

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

    const newInput = async () => {
      const name = prompt('Enter new input fixture name')
      if (!name) return
      const ext = prompt('Enter new input fixture file ext', 'vue')
      if (!ext) return
      const filename = `${name}.input.${ext}`
      if (!confirm(`Ok with filename "${filename}"`)) return
      // TODO:
    }

    const saveInput = async () => {
      // TODO
    }

    // on trans changed
    watch(
      () => store.current,
      (v) => {
        input.value = ''
        output.value = ''
        inputFixtureName.value = (store.fixtures[v] || [])[0] || ''
      },
      { immediate: true }
    )

    // on fixture changed
    watch(
      () => inputFixtureName.value,
      () => {
        if (inputFixtureName.value) {
          inputPath.value = getFixturePath(
            store.current,
            inputFixtureName.value
          )
        } else {
          inputPath.value = ''
        }
      },
      { immediate: true }
    )

    // on local file changed
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
      newInput,
      inputChanged,
      inputPath,
      inputFixtureName,
      saveInput,
    }
  },
})
</script>
