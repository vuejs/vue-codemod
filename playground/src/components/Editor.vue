<template>
  <div>
    <div class="bg-gray-200 p-1">
      <span class="text-gray-600 align-middle font-mono px-2">{{filepath}}</span>
      <a :href="href">
        <button
          class="bg-transparent text-sm text-gray-500 hover:text-gray-600 border border-gray-400 hover:border-gray-600 px-2 rounded align-middle"
        >Open in VS Code</button>
      </a>
    </div>
    <pre class="text-xs">{{code}}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { store } from '../store'

export default defineComponent({
  props: {
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
      },
      { immediate: true }
    )

    const href = computed(
      () =>
        `${store.config.vscodeInsiders ? 'vscode-insiders' : 'vscode'}://file/${
          store.rootPath
        }/${props.filepath}`
    )

    return {
      code,
      href,
    }
  },
})
</script>
