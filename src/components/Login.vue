<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center">
        <h2 class="text-3xl font-bold text-white">登录</h2>
      </div>
      
      <form @submit.prevent="handleLogin" class="p-8">
        <div class="mb-6">
          <label for="username" class="block text-gray-700 text-sm font-bold mb-2">用户名</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="请输入用户名"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="请输入密码"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
        </div>
        
        <div v-if="error" class="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">{{ error }}</div>
        
        <button 
          type="submit" 
          :disabled="loading" 
          @click="handleLogin"
          class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="px-8 pb-8 text-center">
        <p class="text-gray-600">
          还没有账号？
          <router-link to="/register" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-300">
            立即注册
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

// 注入认证状态
const authStore = inject('authStore')
const router = useRouter()

// 表单数据
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// 处理登录
const handleLogin = async () => {
  // 清除之前的错误信息
  error.value = ''

  // 验证表单
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  // 显示加载状态
  loading.value = true

  try {
    // 调用登录函数
    const result = await authStore.login(username.value, password.value)

    if (result.success) {
      // 登录成功，重定向到主应用
      router.push('/home')
    } else {
      // 登录失败，显示错误信息
      error.value = result.message
      setTimeout(() => {
        error.value = ''
      }, 3000)
    }
  } catch (err) {
    // 捕获异常
    error.value = '登录过程中发生错误'
    console.error('登录错误:', err)
    setTimeout(() => {
      error.value = ''
    }, 3000)
  } finally {
    // 隐藏加载状态
    loading.value = false
  }
}
</script>

<style scoped>
/* 所有样式已移至Tailwind CSS类中 */
</style>