<template>
  <Navbar/>
  <TransformView/>
  <!--<Panels v-if='current'>
    <template v-slot:left>
      <Editor :filepath='`/transformations/${current}.ts`' :title='current'/>
    </template>
    <template v-slot:right>
      <Editor :filepath='`/transformations/${current}.ts`' :title='current'/>
    </template>
  </Panels>-->
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
