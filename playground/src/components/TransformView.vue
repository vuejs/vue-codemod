<template>
<Panels>
  <template v-slot:left>
    <Editor value='hello' title='Input'/>
  </template>
  <template v-slot:right>
    <Editor v-model='result' title='Output' readonly/>
  </template>
</Panels>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'

export default defineComponent({
  setup() {
    const result = ref('')


    return {
      result
    }
  }
})
</script>
