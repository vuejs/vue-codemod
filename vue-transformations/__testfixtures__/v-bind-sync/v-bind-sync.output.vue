<template>
  <div class="hello">
    <ChildComponent v-model:title="pageTitle" />
    <ChildComponent v-model:propName="foo" />
    <ChildComponent v-model:[dynamiArg]="foo" />
    <ChildComponent v-model:propName="foo" />

    <!-- incorrect usage, not transform -->
    <ChildComponent v-bind.sync="foo" />
  </div>
</template>
