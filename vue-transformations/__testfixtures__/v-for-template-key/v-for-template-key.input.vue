<template>
  <div id="app">
    <template v-for="item in items">
      <ul id="v-for-object" class="demo">
        <li class="example-1" v-for="value in object" v-bind:key="value.id">
          {{ value }}
        </li>
      </ul>
      <li
        class="example-2"
        :key="'bodying-id' + item.game.id + 'bodying-name'"
        role="presentation"
      ></li>
      <div>
        <li
          class="example-1"
          :key="'bottom-' + item.id"
          role="presentation"
        ></li>
      </div>
    </template>
  </div>
</template>
