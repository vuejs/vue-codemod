<template>
  <div id="app">
    <div v-if="condition" key="yes">Yes</div>
    <div v-else-if="condition1" key="no">No</div>
    <div v-else key="no">No</div>
  </div>
</template>
