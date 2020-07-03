<template>
  <div class="grid grid-rows-fix-auto h-auto overflow-hidden">
    <div class="bg-gray-200 p-1 border-grey-700 border-0 border-b flex">
      <slot name="title">
        <div class="text-gray-600 text-xs m-auto px-2">{{title || filepath}}</div>
        <OpenInEditor :filepath="filepath" />
      </slot>
      <div class="flex-auto" />
      <div class="mx-1 flex">
        <slot name="actions"></slot>
      </div>
    </div>
    <CodeMirror v-model:code="code" :options="cmOptions" class="h-auto overflow-auto" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref, nextTick } from 'vue'
import { usePropsRef } from '../utils'

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
    changed: {
      type: Boolean,
    },
  },
  emits: ['update:value', 'update:changed', 'ready'],
  setup(props, { emit }) {
    const original = ref(props.value || '')
    const code = usePropsRef<string>(props, 'value', emit)
    const fileChanged = usePropsRef<boolean>(props, 'changed', emit)

    watch(
      () => [code.value, original.value],
      ([c, o]) => {
        fileChanged.value = c !== o
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
          .then(async (r) => {
            code.value = r
            original.value = r
            await nextTick()
            emit('ready')
          })
          .catch(() => {
            code.value = ''
            original.value = ''
          })
      },
      { immediate: true }
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
      cmOptions,
      fileChanged,
    }
  },
})
</script>
