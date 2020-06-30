<template>
  <Navbar/>
  <Editor v-if='current' :filepath='`/transformations/${current}.ts`' :title='current'/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { store } from './store'

export default defineComponent({
  setup() {
    return store
  }
})
</script>
