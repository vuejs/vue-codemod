<template>
  <template v-if="items.length">
    <select
      v-model="model"
      class="px-2 py-0 pr-8 text-sm text-gray-600 border-r border-gray-400 bg-transparent w-auto focus:outline-none appearance-none"
    >
      <option v-for="i in items" :value="i" :key="i">{{getText(i)}}</option>
    </select>
    <div class="text-lg p-1 m-auto -ml-8 mr-3 pointer-events-none opacity-50">
      <span class="iconify" data-icon="ri:arrow-down-s-line" data-inline="false"></span>
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { store } from '../store'
import { usePropsRef } from '../utils'

export default defineComponent({
  props: {
    value: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    changed: {
      type: Boolean,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const model = usePropsRef<string>(props, 'value', emit)
    const items = computed(() => {
      return (store.fixtures[store.current] || []).filter((i) =>
        i.match(new RegExp(props.type))
      )
    })

    const getText = (i: string) => {
      if (i === model.value && props.changed) {
        return `${i}*`
      }
      return i
    }

    return {
      model,
      items,
      getText,
    }
  },
})
</script>
