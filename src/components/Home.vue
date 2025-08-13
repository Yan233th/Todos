<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
        <h1 class="text-3xl font-bold text-white">ToDos</h1>
        <p class="text-indigo-200 mt-2">您已成功登录!</p>
      </div>
      
      <div class="p-6">
        <div class="user-info bg-gray-50 rounded-lg p-4 mb-6" v-if="user">
          <h2 class="text-xl font-semibold text-gray-800 mb-3">用户信息</h2>
          <div class="space-y-2">
            <p class="flex justify-between">
              <span class="text-gray-600">用户名:</span>
              <span class="font-medium">{{ user.username }}</span>
            </p>
            <p class="flex justify-between">
              <span class="text-gray-600">角色:</span>
              <span class="font-medium">{{ user.role }}</span>
            </p>
            <p class="flex justify-between">
              <span class="text-gray-600">用户组:</span>
              <span class="font-medium">{{ groupName || '无' }}</span>
            </p>
            <p class="flex justify-between" v-if="user.expiresAt">
              <span class="text-gray-600">Token过期时间:</span>
              <span class="font-medium">{{ formatDate(user.expiresAt) }}</span>
            </p>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500">加载用户信息中...</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            @click="logout" 
            class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            退出登录
          </button>
          <button 
            @click="forceLogout" 
            class="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            清除所有登录数据
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'
import api from '../api.js'
import axios from 'axios'

// 注入认证状态
const authStore = inject('authStore')
const router = useRouter()

// 挂载时获取用户信息并验证token
onMounted(async () => {
  console.log('认证状态:', authStore.isAuthenticated.value)
  console.log('用户信息:', authStore.user.value)
  console.log('Token:', authStore.token.value)
  
  // 获取用户组名称
  await authStore.fetchGroupName()
})

// 计算属性获取用户信息
const user = computed(() => authStore.user.value)

// 用户组名称
const groupName = computed(() => authStore.groupName.value)

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
/* 所有样式已移至Tailwind CSS类中 */
</style>