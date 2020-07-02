<template>
  <Navbar />
  <TransformView />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { store } from './store'

export default defineComponent({
  setup() {
    return store
  },
})
</script>
