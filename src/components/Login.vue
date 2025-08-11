<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          type="text"
          id="username"
          v-model="username"
          required
          placeholder="请输入用户名"
        >
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="请输入密码"
        >
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button type="submit" :disabled="loading" @click="handleLogin">
  <span v-if="loading">登录中...</span>
  <span v-else>登录</span>
</button>
    </form>
    <div class="register-link">
      还没有账号？<router-link to="/register">立即注册</router-link>
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
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}

.error-message {
  color: #f44336;
  margin-bottom: 15px;
  text-align: center;
}

.register-link {
  margin-top: 15px;
  text-align: center;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>