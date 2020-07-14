<template>
  <div class="relative h-auto overflow-hidden" @mousemove="onMove" @mouseup="pressed = false">
    <div class="panels grid h-full" :style="style">
      <slot name="left"></slot>
      <slot name="right"></slot>
    </div>
    <div class="panels-handler" :style="style" @mousedown="pressed = true">
      <div class="inner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  setup() {
    const left = ref(0.5)
    const pressed = ref(false)

    const style = computed(() => {
      return {
        '--left': `${left.value * 100}vw`,
      }
    })

    const onMove = (e: MouseEvent) => {
      if (pressed.value) {
        left.value = Math.min(Math.max(0.1, e.clientX / window.innerWidth), 0.9)
      }
    }

    return {
      left,
      style,
      pressed,
      onMove,
    }
  },
})
</script>

<style>
.panels {
  grid-template-columns: var(--left) auto;
}

.panels-handler {
  position: absolute;
  top: 0;
  left: calc(var(--left) - 4.5px);
  bottom: 0;
  width: 9px;
  padding: 0 3px;
  z-index: 100;
  cursor: col-resize;
  user-select: none;
}

.panels-handler .inner {
  width: 3px;
  background: white;
  border-left: 1px solid #2222;
  border-right: 1px solid #2222;
  height: 100%;
  z-index: 100;
}
</style>
