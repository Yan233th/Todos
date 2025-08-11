import axios from 'axios'
import { ref, watchEffect } from 'vue'
import { createAuthStore } from './store/auth'
import { API_BASE_URL } from './config'

// 后端API基础URL

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 创建认证存储
const authStore = createAuthStore()

// 请求拦截器 - 自动添加token
api.interceptors.request.use(config => {
  if (authStore.isAuthenticated.value && authStore.token.value) {
    config.headers.Authorization = `Bearer ${authStore.token.value}`
  }
  return config
})

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // 如果是401错误且不是重试请求，则尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 检查是否是用户不存在的错误
      const isUserNotFound = error.response?.data?.message === '用户不存在'

      if (isUserNotFound) {
        // 用户不存在，直接强制登出
        authStore.forceLogout()
        return Promise.reject(error)
      }

      try {
        // 尝试刷新token
        const refreshResult = await authStore.refreshToken()
        if (refreshResult.success) {
          // 刷新成功，重试原始请求
          originalRequest.headers.Authorization = `Bearer ${authStore.token.value}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // 刷新失败，强制登出
        authStore.forceLogout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api