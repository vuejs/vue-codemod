<template>
  <p>{{ greeting }} World!</p>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      greeting: "Hello"
    };
  }
});
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
