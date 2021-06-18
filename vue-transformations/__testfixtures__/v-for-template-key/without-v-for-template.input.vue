<template>
  <div>
    <div>
      <switch-roles @change="handleRolesChange" />
      <div :key="key">
        <span v-permission="['button']">
          <el-button type="button">button</el-button>
        </span>
      </div>
    </div>
  </div>
</template>
