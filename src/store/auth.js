// 认证状态管理
// 包含用户验证、JWT令牌、过期机制和权限管理
import { ref, computed } from 'vue'
import axios from 'axios'

// 后端API基础URL
const API_BASE_URL = 'http://localhost:3001'

export function createAuthStore() {
  // 从localStorage获取认证状态
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const tokenExpiry = ref(localStorage.getItem('authTokenExpiry') || null)

  // 解析JWT令牌
  function decodeToken(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('无效的token格式')
      }

      const decodedPayload = JSON.parse(atob(parts[1]))
      return decodedPayload
    } catch (error) {
      throw new Error('token解析失败')
    }
  }

  // 初始化时检查token有效性
  // 注意：这里会从localStorage读取之前保存的token，如果有效则自动登录
  initAuth()

  function initAuth() {
    if (token.value && tokenExpiry.value) {
      const expiryTime = parseInt(tokenExpiry.value)
      if (Date.now() < expiryTime) {
        // Token未过期，解析用户信息
        try {
          const decoded = decodeToken(token.value)
          isAuthenticated.value = true
          user.value = decoded.user
        } catch (error) {
          console.error('Token解析失败:', error)
          clearAuthData()
        }
      } else {
        // Token已过期
        clearAuthData()
      }
    }
  }

  // 注册函数
  async function register(username, password) {
    try {
      // 调用后端注册API
      const response = await axios.post(`${API_BASE_URL}/register`, { username, password })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      console.error('注册失败:', error)
      if (error.response && error.response.data && error.response.data.message) {
        return { success: false, message: error.response.data.message }
      }
      return { success: false, message: '注册失败，请重试' }
    }
  }

  // 登录函数
  async function login(username, password) {
    try {
      // 调用后端登录API
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password })
      
      const { token: newToken, user: userInfo } = response.data
      
      // 计算过期时间（JWT通常包含exp字段）
      const decodedToken = decodeToken(newToken)
      const expiry = decodedToken.exp * 1000 // JWT的exp是秒数，转换为毫秒

      // 存储认证数据
      token.value = newToken
      tokenExpiry.value = expiry.toString()
      localStorage.setItem('authToken', newToken)
      localStorage.setItem('authTokenExpiry', expiry.toString())

      // 更新状态
      isAuthenticated.value = true
      user.value = userInfo

      return { success: true, message: '登录成功' }
    } catch (error) {
      console.error('登录失败:', error)
      if (error.response && error.response.data && error.response.data.message) {
        return { success: false, message: error.response.data.message }
      }
      return { success: false, message: '登录失败，请重试' }
    }
  }

  // 退出登录函数
  function logout() {
    clearAuthData()
  }

  // 清除认证数据
  function clearAuthData() {
    token.value = null
    tokenExpiry.value = null
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('authTokenExpiry')
  }

  // 强制清除所有认证数据（包括localStorage）
  function forceLogout() {
    clearAuthData()
    // 确保完全清除，防止任何残留数据导致的自动登录
    window.location.reload()
  }

  // 生成模拟JWT令牌
  function generateToken(userInfo, expiry) {
    // 简化版JWT生成，实际应用应使用专门的JWT库
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = {
      sub: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
      exp: Math.floor(expiry / 1000),
      user: {
        username: userInfo.username,
        email: userInfo.email,
        role: userInfo.role,
        permissions: userInfo.permissions
      }
    }

    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    // 简化的签名，实际应用应使用密钥进行HMAC签名
    const signature = btoa(`${encodedHeader}.${encodedPayload}`)

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  // 解析JWT令牌
  function decodeToken(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('无效的token格式')
      }

      const decodedPayload = JSON.parse(atob(parts[1]))
      return decodedPayload
    } catch (error) {
      throw new Error('token解析失败')
    }
  }

  // 检查权限
  function hasPermission(permission) {
    return isAuthenticated.value &&
           user.value &&
           user.value.permissions &&
           user.value.permissions.includes(permission)
  }

  // 检查角色
  function hasRole(role) {
    return isAuthenticated.value &&
           user.value &&
           user.value.role === role
  }

  // 刷新token
  async function refreshToken() {
    try {
      if (!isAuthenticated.value || !token.value || !tokenExpiry.value) {
        return { success: false, message: '未登录或token无效' }
      }

      const currentTime = Date.now()
      const expiryTime = parseInt(tokenExpiry.value)

      // 在token过期前5分钟刷新
      if (currentTime < expiryTime - 300000) {
        return { success: false, message: 'token未到刷新时间' }
      }

      // 模拟API调用刷新token
      await new Promise(resolve => setTimeout(resolve, 500))

      // 生成新token
      const expiry = Date.now() + 3600000 // 1小时过期
      const newToken = generateToken(user.value, expiry)

      // 更新token
      token.value = newToken
      tokenExpiry.value = expiry.toString()
      localStorage.setItem('authToken', newToken)
      localStorage.setItem('authTokenExpiry', expiry.toString())

      return { success: true, message: 'token刷新成功' }
    } catch (error) {
      console.error('token刷新失败:', error)
      clearAuthData()
      return { success: false, message: 'token刷新失败，请重新登录' }
    }
  }

  return {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout,
    forceLogout,
    hasPermission,
    hasRole,
    refreshToken
  }
}