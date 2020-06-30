<template>
<div class="relative h-auto overflow-hidden">
  <div class="panels grid h-full" :style='{"--left": "50vw"}'>
    <slot name='left'></slot>
    <slot name='right'></slot>
  </div>
  <div class="panels-handler" :style='{"--left": "50vw"}'>
    <div class="inner"></div>
  </div>
</div>
</template>


<style>
.panels {
  grid-template-columns: var(--left) auto;
}

.panels-handler {
  position: absolute;
  top: 0;
  left: calc(var(--left) - 4.5px);
  bottom: 0;
  width: 9px;
  padding: 0 3px;
  z-index: 100;
  cursor: col-resize;
}

.panels-handler .inner {
  width: 3px;
  border-left: 1px solid #2225;
  border-right: 1px solid #2225;
  height: 100%;
  z-index: 100;
}
</style>
