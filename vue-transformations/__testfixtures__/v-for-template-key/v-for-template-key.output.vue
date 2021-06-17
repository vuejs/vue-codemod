<template>
  <div id="app">
    <template v-for="item in items" :key="'bodying-id' + item.game.id + 'bodying-name'">
      <ul id="v-for-object" class="demo">
        <li class="example-1" v-for="value in object" v-bind:key="value.id">
          {{ value }}
        </li>
      </ul>
      <li
        class="example-2"
        
        role="presentation"
      ></li>
      <div>
        <li
          class="example-1"
          
          role="presentation"
        ></li>
      </div>
    </template>
  </div>
</template>
