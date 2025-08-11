<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// 根组件只负责渲染路由视图
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>