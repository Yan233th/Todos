<template>
  <div class="login-container">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister">
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
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          placeholder="请确认密码"
        >
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button type="submit" :disabled="loading" @click="handleRegister">
  <span v-if="loading">注册中...</span>
  <span v-else>注册</span>
</button>
    </form>
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
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

// 处理注册
const handleRegister = async () => {
  // 清除之前的错误信息
  error.value = ''

  // 验证表单
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  // 显示加载状态
  loading.value = true

  try {
    // 调用注册函数
    const result = await authStore.register(username.value, password.value)

    if (result.success) {
      // 注册成功，跳转到登录页面
      error.value = '注册成功，请登录'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      // 注册失败，显示错误信息
      error.value = result.message
      setTimeout(() => {
        error.value = ''
      }, 3000)
    }
  } catch (err) {
    // 捕获异常
    error.value = '注册过程中发生错误'
    console.error('注册错误:', err)
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
  margin-bottom: 20px;
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
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>