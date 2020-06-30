<template>
  <div>
    <div class="bg-gray-200 p-1">
      <span class="text-gray-600 align-middle font-mono text-xs px-2">{{title || filepath}}</span>
      <a :href="href">
        <button
          class="bg-transparent text-xs text-gray-500 hover:text-gray-600 border border-gray-400 hover:border-gray-600 px-2 rounded align-middle"
        >Open in VS Code</button>
      </a>
    </div>
    <CodeMirror v-model:code="code" :options='cmOptions' :height='650'/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
// @ts-ignore
import { store } from '../store'

export default defineComponent({
  props: {
    title: {
      type: String
    },
    filepath: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const code = ref('')

    watch(
      () => props.filepath,
      () => {
        fetch(`/api/files/${props.filepath}`)
          .then((r) => r.text())
          .then((r) => {
            code.value = r
          })
          .catch(() => {
            code.value = ''
          })
      },
      { immediate: true }
    )

    const href = computed(
      () =>
        `${store.config.vscodeInsiders ? 'vscode-insiders' : 'vscode'}://file/${
          store.rootPath
        }/${props.filepath}`
    )

    const mode = computed(()=>{
      if (props.filepath.endsWith('.vue'))
        return 'vue'
      else
        return 'text/typescript'
    })

    const cmOptions = computed(()=>{
      return {
        mode: mode.value,
        lineNumbers: true,
        line: true,
        tabSize: 2,
        readonly: true,
      }
    })

    return {
      code,
      href,
      mode,
      cmOptions
    }
  },
})
</script>
