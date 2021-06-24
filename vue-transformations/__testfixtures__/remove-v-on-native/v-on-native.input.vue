<template>
  <div>
    <!-- ✓ GOOD -->
    <CoolInput v-on:keydown.enter="onKeydownEnter" />
    <CoolInput @keydown.enter="onKeydownEnter" />

    <!-- ✗ BAD -->
    <CoolInput v-on:keydown.native="onKeydown" />
    <CoolInput @keydown.enter.native="onKeydownEnter" />
  </div>
</template>
