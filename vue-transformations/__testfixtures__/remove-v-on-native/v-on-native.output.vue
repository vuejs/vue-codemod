<template>
  <div>
    <!-- ✓ GOOD -->
    <CoolInput v-on:keydown.enter="onKeydownEnter" />
    <CoolInput @keydown.enter="onKeydownEnter" />

    <!-- ✗ BAD -->
    <!-- native modifier has been removed, please confirm whether the function has been affected  -->
    <CoolInput v-on:keydown="onKeydown" />
    <!-- native modifier has been removed, please confirm whether the function has been affected  -->
    <CoolInput @keydown.enter="onKeydownEnter" />
  </div>
</template>
