<template>
  <Panels>
    <template v-slot:left>
      <Editor
        v-model:value="input"
        v-model:changed="inputChanged"
        @ready="run"
        :filepath="inputPath"
        :counter="inputCounter"
        title="Input"
        mode="text/x-vue"
      >
        <template v-slot:title>
          <FixtureSelect v-model:value="inputFixtureName" type="input" :changed="inputChanged" />
          <button @click="newInput" class="btn-icon text-lg">
            <span class="iconify" data-icon="ri:add-circle-line" data-inline="false"></span>
          </button>
          <button
            @click="saveInput"
            v-show="inputFixtureName"
            class="btn-icon text-lg"
            :class="{disabled: !inputChanged}"
          >
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
        <template v-slot:title>
          <div class="text-gray-600 text-sm m-auto px-2">{{outputFixtureName || 'Output'}}</div>
          <button @click="saveOutput" v-show="outputFixtureName" class="btn-icon text-lg">
            <span class="iconify" data-icon="ri:save-line" data-inline="false"></span>
          </button>
        </template>
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
import { defineComponent, ref, watch, onMounted, computed } from 'vue'
import { store, initStore } from '../store'
import { VueTemplate } from '../templates'
import { useFileWatcher } from '../watcher'
import { getFixturePath } from '../utils'

export default defineComponent({
  setup() {
    const input = ref(VueTemplate)
    const output = ref('')
    const lastUpdate = ref('')
    const inputCounter = ref(0)
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

    const saveFile = async (filepath: string, content: string) => {
      await fetch(`/api/files/${filepath}`, {
        method: 'POST',
        body: content,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    const newInput = async () => {
      const name = prompt('Enter new input fixture name')
      if (!name) return
      const ext = prompt('Enter new input fixture file ext', 'vue')
      if (!ext) return
      const filename = `${name}.input.${ext}`
      if (!confirm(`Ok with filename "${filename}"`)) return
      await saveFile(getFixturePath(store.current, filename), input.value)
      await initStore()
      inputFixtureName.value = filename
    }

    const saveInput = () => {
      saveFile(inputPath.value, input.value)
      inputCounter.value += 1
    }
    const saveOutput = () => {
      saveFile(
        getFixturePath(store.current, outputFixtureName.value),
        output.value
      )
    }

    const outputFixtureName = computed(() =>
      inputFixtureName.value.replace('.input.', '.output.')
    )

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

    onMounted(() => {
      // capture ctrl+s and cmd+s
      document.addEventListener(
        'keydown',
        function (e) {
          if (
            (window.navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) &&
            e.keyCode == 83
          ) {
            e.preventDefault()
            // currently only work for input panel
            // consider save file base on current focus in the future
            saveInput()
          }
        },
        false
      )
    })

    return {
      output,
      input,
      run,
      lastUpdate,
      newInput,
      inputChanged: false,
      inputPath,
      inputFixtureName,
      inputCounter,
      saveInput,
      saveOutput,
      outputFixtureName,
    }
  },
})
</script>
