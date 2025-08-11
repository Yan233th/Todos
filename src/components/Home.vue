<template>
  <div class="home-container">
    <h1>ToDos</h1>
    <p>您已成功登录!</p>
    <div class="user-info" v-if="user">
      <p>用户名: {{ user.username }}</p>
      <p>角色: {{ user.role }}</p>
      <p>用户组: {{ user.group }}</p>
      <p v-if="user.expiresAt">Token过期时间: {{ formatDate(user.expiresAt) }}</p>
    </div>
    <div v-else>
      <p>加载用户信息中...</p>
    </div>
    <div class="button-group">
      <button @click="logout">退出登录</button>
      <button @click="forceLogout" class="force-logout">清除所有登录数据</button>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

// 注入认证状态
const authStore = inject('authStore')
const router = useRouter()

// 挂载时获取用户信息并验证token
onMounted(() => {
  console.log('认证状态:', authStore.isAuthenticated.value)
  console.log('用户信息:', authStore.user.value)
  console.log('Token:', authStore.token.value)

  // 测试API请求
  testApiRequest()
})

// 测试API请求
async function testApiRequest() {
  try {
    // 这里可以替换为实际的API端点
    const response = await api.get('/test-auth')
    console.log('API请求成功:', response.data)
  } catch (error) {
    console.error('API请求失败:', error)
  }
}

// 计算属性获取用户信息
const user = computed(() => authStore.user.value)

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 退出登录函数
const logout = () => {
  authStore.logout()
  router.push('/login')
}

// 强制清除所有登录数据
const forceLogout = () => {
  authStore.forceLogout()
}

</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.user-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  text-align: left;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

h1 {
  color: #333;
}

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}

.force-logout {
  background-color: #e74c3c;
}

.force-logout:hover {
  background-color: #c0392b;
}
</style>