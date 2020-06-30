<template>
  <pre>{{JSON.stringify(transformations, null, 2)}}</pre>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: String
    }
  },
  setup(props){
    const transformations = ref([])

    fetch('/api/transformations')
      .then(r => r.json())
      .then(r => {
        transformations.value = r
      })

    return {
      transformations
    }
  }
})
</script>
