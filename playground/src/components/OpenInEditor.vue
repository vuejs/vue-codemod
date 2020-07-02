<template>
  <a v-if="href" :href="href">
    <button class="btn-icon" v-bind="$attrs">
      <span class="iconify" data-icon="mdi:microsoft-visual-studio-code" data-inline="false"></span>
    </button>
  </a>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { store } from '../store'

export default defineComponent({
  inheritAttrs: false,
  props: {
    filepath: {
      type: String,
    },
  },
  setup(props) {
    const href = computed(() =>
      props.filepath
        ? `${
            store.config.vscodeInsiders ? 'vscode-insiders' : 'vscode'
          }://file/${store.rootPath}/${props.filepath}`
        : ''
    )

    return {
      href,
    }
  },
})
</script>
