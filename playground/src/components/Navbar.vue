<template>
  <nav class="flex items-center justify-between flex-wrap p-3" style='background: #42b883'>
    <div class="flex items-center flex-shrink-0 text-white mr-6 ml-4">
      <div class="leading-none">
        <span class="font-semibold text-lg tracking-tight">Vue Codemod</span>
        <br>
        <span class="font-light text-lg tracking-tight">Playground</span>
      </div>
    </div>
    <div class="flex flex-grow items-center w-auto">
      <div class="text-sm flex-grow">
        <!--<a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">
          Docs
        </a>-->
      </div>
      <div>
        <TransformationSelect/>
      </div>
    </div>
  </nav>
</template>
