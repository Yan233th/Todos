<template>
  <div class="text-sm text-gray-900">
    <nav class="flex items-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 justify-between">
      <div class="flex items-center">
        <a class="transition-all duration-500 text-2xl font-bold text-white hover:text-gray-300" href="/home">ToDos</a>
      </div>
      <div class="flex items-center space-x-4">
        <div class="relative group">
          <div class="flex items-center space-x-2 cursor-pointer text-white py-1 px-3 rounded-lg transition-all duration-300 bg-indigo-600 hover:bg-indigo-700">
            <div class="flex flex-col items-start">
              <span class="font-medium text-1xl">{{ user.name || 'Guest' }}</span>
              <span class="text-xs text-indigo-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ groupName || '无用户组' }}
              </span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
            <button @click="forceLogout" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
              <span class="flex items-center text-red-600 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
  </div>  
</template>

<script setup>
import { inject, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'
import api from '../api.js'
import axios from 'axios'

// 设置axios默认响应类型以支持中文字符
axios.defaults.responseType = 'json';
axios.defaults.headers.common['Accept'] = 'application/json; charset=utf-8';

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