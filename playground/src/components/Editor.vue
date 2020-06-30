<template>
  <div class="grid grid-rows-fix-auto h-auto overflow-hidden">
    <div class="bg-gray-200 p-1 border-grey-700 border-0 border-b">
      <span class="text-gray-600 align-middle font-mono text-xs px-2">{{title || filepath}}</span>
      <a v-if="href" :href="href">
        <button
          class="bg-transparent text-xs text-gray-500 hover:text-gray-600 border border-gray-400 hover:border-gray-600 px-2 rounded align-middle"
        >Open in VS Code</button>
      </a>
      <slot name="actions"></slot>
    </div>
    <CodeMirror v-model:code="code" :options="cmOptions" class="h-auto overflow-auto" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
// @ts-ignore
import { store } from '../store'

export default defineComponent({
  props: {
    title: {
      type: String,
    },
    filepath: {
      type: String,
    },
    value: {
      type: String,
    },
    mode: {
      type: String,
    },
    readonly: {
      type: Boolean,
    },
  },
  setup(props) {
    const code = ref(props.value || '')

    watch(
      () => props.value,
      () => {
        if (props.value) {
          code.value = props.value
        }
      }
    )

    watch(
      () => props.filepath,
      () => {
        if (!props.filepath) {
          return
        }
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

    const href = computed(() =>
      props.filepath
        ? `${
            store.config.vscodeInsiders ? 'vscode-insiders' : 'vscode'
          }://file/${store.rootPath}/${props.filepath}`
        : ''
    )

    const cmOptions = computed(() => {
      return {
        mode:
          props.mode ||
          (props.filepath?.endsWith('.vue') ? 'text/x-vue' : 'text/typescript'),
        lines: true,
        lineNumbers: true,
        tabSize: 2,
        readOnly: !!props.readonly,
      }
    })

    return {
      code,
      href,
      cmOptions,
    }
  },
})
</script>
