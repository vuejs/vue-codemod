<template>
  <div class="hello">
    <ChildComponent :title.sync="pageTitle" />
    <ChildComponent v-bind:propName.sync="foo" />
    <ChildComponent v-bind:[dynamiArg].sync="foo" />
    <ChildComponent :propName.sync="foo" />

    <!-- incorrect usage, not transform -->
    <ChildComponent v-bind.sync="foo" />
  </div>
</template>
