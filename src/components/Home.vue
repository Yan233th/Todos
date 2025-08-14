<template>
  <div class="min-h-screen bg-gray-50">
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
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">欢迎来到任务管理系统</h1>
      <p class="text-gray-600 mb-8">在这里您可以管理您的所有任务，提高工作效率。</p>
    </div>
    
    <!-- 浮动添加Todo按钮 -->
    <div class="fixed bottom-8 right-8 z-40 transition-all duration-300 hover:scale-110">
      <button 
        @click="showAddTodoModal"
        class="btn btn-primary btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
    
    <!-- Toast提醒容器 -->
    <div class="toast toast-start toast-bottom z-50">
      <div v-if="toastMessage" :class="['alert', toastType === 'success' ? 'alert-success' : 'alert-error']">
        <!-- 成功图标 -->
        <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <!-- 错误图标 -->
        <svg v-if="toastType === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
    
    <!-- 添加Todo模态框 -->
    <div v-if="isAddTodoModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-1">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">添加新任务</h3>
        </div>
        <div class="px-6 py-4">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="todo-name">
              任务名称 *
            </label>
            <input 
              v-model="newTodoName" 
              id="todo-name" 
              type="text" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="请输入任务名称"
            >
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="todo-description">
              任务描述
            </label>
            <textarea 
              v-model="newTodoDescription" 
              id="todo-description" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="请输入任务描述"
              rows="3"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="todo-deadline">
              截止日期
            </label>
            <input 
              v-model="newTodoDeadline" 
              id="todo-deadline" 
              type="date" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="todo-priority">
              优先级
            </label>
            <select 
              v-model="newTodoPriority" 
              id="todo-priority" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="紧急">紧急</option>
              <option value="重要">重要</option>
              <option value="普通">普通</option>
              <option value="低">低</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="todo-status">
              状态
            </label>
            <select 
              v-model="newTodoStatus" 
              id="todo-status" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="未开始">未开始</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
              <option value="已取消">已取消</option>
            </select>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button 
            @click="isAddTodoModalVisible = false" 
            class="btn btn-ghost"
          >
            取消
          </button>
          <button 
            @click="submitNewTodo" 
            class="btn btn-primary"
          >
            添加任务
          </button>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onMounted } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '../config'

// 设置axios默认响应类型以支持中文字符
axios.defaults.responseType = 'json';
axios.defaults.headers.common['Accept'] = 'application/json; charset=utf-8';

// 注入认证状态
const authStore = inject('authStore')

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

// 强制清除所有登录数据
const forceLogout = () => {
  authStore.forceLogout()
}

// 添加Todo相关
const showAddTodoModal = () => {
  // 初始化模态框数据
  newTodoName.value = ''
  newTodoDescription.value = ''
  newTodoDeadline.value = ''
  newTodoPriority.value = '普通'
  newTodoStatus.value = '未开始'
  
  // 显示模态框
  isAddTodoModalVisible.value = true
}

// 新Todo数据
const newTodoName = ref('')
const newTodoDescription = ref('')
const newTodoDeadline = ref('')
const newTodoPriority = ref('普通')
const newTodoStatus = ref('未开始')
const isAddTodoModalVisible = ref(false)

// Toast提醒数据
const toastMessage = ref('')
const toastType = ref('success') // 'success' 或 'error'

// 显示Toast消息
const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  
  // 3秒后自动隐藏Toast
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 提交新Todo
const submitNewTodo = async () => {
  try {
    // 验证必填字段
    if (!newTodoName.value.trim()) {
      showToast('请输入任务名称', 'error')
      return
    }
    
    // 准备数据
    const todoData = {
      name: newTodoName.value,
      description: newTodoDescription.value,
      deadline: newTodoDeadline.value || null,
      priority: newTodoPriority.value,
      status: newTodoStatus.value
    }
    
    // 发送请求
    const response = await axios.post(`${API_BASE_URL}/todos`, todoData, {
      headers: {
        'Authorization': `Bearer ${authStore.token.value}`
      }
    })
    
    // 检查响应状态码
    if (response.status === 201) {
      // 成功后隐藏模态框
      isAddTodoModalVisible.value = false
      
      // 显示成功消息
      showToast('任务添加成功', 'success')
      
      // TODO: 刷新任务列表（如果有的话）
      // 这里可以触发一个事件或者调用刷新方法
    } else {
      showToast('添加失败: ' + response.data.message, 'error')
    }
  } catch (error) {
    console.error('添加任务失败:', error)
    showToast('添加任务失败，请重试', 'error')
  }
}
</script>