<template>
<select
  v-model='current'
  class="inline-block appearance-none outline-none bg-transparent text-white border-opacity-25 border border-gray-400 hover:border-white text-sm px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
>
  <option v-for='i in transformations' :value='i' :key='i'>{{i}}</option>
</select>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { store } from '../store'

export default defineComponent({
  props: {
    value: {
      type: String
    }
  },
  setup() {
    return store
  }
})
</script>
