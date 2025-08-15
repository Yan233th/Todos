<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="fixed top-0 left-0 right-0 z-50 flex items-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 justify-between">
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
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">个人信息</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">系统设置</a>
            <a v-if="user && user.role === 'admin'" href="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">后台管理</a>
            <button @click="forceLogout" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
              <span class="flex items-center text-red-600 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                登出
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="container mx-auto px-4 pt-24 pb-8">
      <div class="flex items-center mb-6">
        <button @click="goBack" class="btn btn-ghost btn-sm mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          返回
        </button>
        <h1 class="text-3xl font-bold text-gray-800">任务详情</h1>
      </div>
      
      <div v-if="loading" class="text-center py-8">
  <div class="loading loading-spinner loading-lg"></div>
  <p class="mt-2 text-gray-600">加载中...</p>
  <p class="mt-2 text-gray-600">任务ID: {{ route.params.id }}</p>
</div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
  <strong class="font-bold">错误: </strong>
  <span class="block sm:inline">{{ error }}</span>
  <p class="mt-2 text-gray-600">任务ID: {{ route.params.id }}</p>
</div>
      
      <div v-else-if="todo" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-gray-800">{{ todo.name }}</h2>
            <span 
              class="px-3 py-1 text-sm font-semibold rounded-full" 
              :class="{
                'bg-blue-100 text-blue-800': todo.Status == -1, // 计划中
                'bg-yellow-100 text-yellow-800': todo.Status == 0, // 进行中
                'bg-green-100 text-green-800': todo.Status == 1, // 已完成
                'bg-red-100 text-red-800': todo.Status == 2 // 已取消
              }"
            >
              {{ getStatusText(todo.Status) }}
            </span>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">任务描述</h3>
            <p class="text-gray-600" v-if="todo.description">{{ todo.description }}</p>
            <p class="text-gray-500 italic" v-else>暂无描述</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-700 mb-3">任务信息</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">优先级:</span>
                  <span 
                    class="px-2 py-1 text-xs font-semibold rounded-full" 
                    :class="{
                      'bg-red-100 text-red-800': todo.Priority === '紧急',
                      'bg-orange-100 text-orange-800': todo.Priority === '重要',
                      'bg-blue-100 text-blue-800': todo.Priority === '普通',
                      'bg-gray-100 text-gray-800': todo.Priority === '低'
                    }"
                  >
                    {{ todo.Priority }}
                  </span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">截止时间:</span>
                  <span class="text-gray-800" v-if="todo.Deadline">{{ formatDate(todo.Deadline) }}</span>
                  <span class="text-gray-500 italic" v-else>未设置</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">创建时间:</span>
                  <span class="text-gray-800">{{ formatDate(todo.create_time) }}</span>
                </div>
                
                <div class="flex justify-between" v-if="todo.update_time && todo.update_time !== todo.create_time">
                  <span class="text-gray-600">更新时间:</span>
                  <span class="text-gray-800">{{ formatDate(todo.update_time) }}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-700 mb-3">关联信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-gray-600 block mb-1">关联用户:</span>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-if="todo.Belonging_users && todo.Belonging_users.length > 0" 
                      v-for="id in todo.Belonging_users" 
                      :key="id" 
                      class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ getUserById(id)?.name || id }}
                    </span>
                    <span v-else class="text-gray-500 italic">无关联用户</span>
                  </div>
                </div>
                
                <div>
                  <span class="text-gray-600 block mb-1">关联用户组:</span>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-if="todo.Belonging_groups && todo.Belonging_groups.length > 0" 
                      v-for="id in todo.Belonging_groups" 
                      :key="id" 
                      class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      {{ getGroupById(id)?.name || id }}
                    </span>
                    <span v-else class="text-gray-500 italic">无关联用户组</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="editTodo" 
              class="btn btn-primary"
            >
              编辑任务
            </button>
            <button 
              @click="deleteTodo" 
              class="btn btn-error"
            >
              删除任务
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../config'

// 注入认证状态
const authStore = inject('authStore')

// 路由相关
const route = useRoute()
const router = useRouter()

// 数据
const todo = ref(null)
const loading = ref(true)
const error = ref(null)

// 用户和组数据
const allUsers = ref([])
const allGroups = ref([])

// 获取用户信息
const user = computed(() => authStore.user.value)
const groupName = ref('')

onMounted(async () => {
  try {
    console.log('TaskDetail onMounted started')
    // 获取用户信息
    user.value = authStore.user.value || {}
    console.log('User info:', user.value)
    
    // 获取用户组名称
    await authStore.fetchGroupName()
    groupName.value = authStore.groupName.value
    console.log('Group name:', groupName.value)
    
    // 获取所有用户和组数据
    await fetchAllUsers()
    await fetchAllGroups()
    console.log('All users:', allUsers.value)
    console.log('All groups:', allGroups.value)
    
    // 获取任务详情
    await fetchTodo()
    console.log('Todo data:', todo.value)
  } catch (error) {
    console.error('Error in onMounted:', error)
    error.value = '页面加载失败: ' + error.message
  }
})

// 获取所有用户
const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${authStore.token.value}`
      }
    })
    
    allUsers.value = response.data.users
  } catch (err) {
    console.error('获取用户数据失败:', err)
  }
}

// 获取所有用户组
const fetchAllGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups`, {
      headers: {
        'Authorization': `Bearer ${authStore.token.value}`
      }
    })
    
    allGroups.value = response.data.groups
  } catch (err) {
    console.error('获取用户组数据失败:', err)
  }
}

// 根据ID获取用户
const getUserById = (id) => {
  return allUsers.value.find(user => user.id === id)
}

// 根据ID获取用户组
const getGroupById = (id) => {
  return allGroups.value.find(group => group.id === id)
}

// 获取任务详情
const fetchTodo = async () => {
  try {
    console.log('Fetching todo with ID:', route.params.id)
    loading.value = true
    error.value = null
    
    const response = await axios.get(`${API_BASE_URL}/todos/${route.params.id}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token.value}`
      }
    })
    
    console.log('Todo response:', response.data)
    todo.value = response.data.todo
    console.log('Todo value set:', todo.value)
  } catch (err) {
    console.error('获取任务详情失败:', err)
    error.value = '获取任务详情失败，请重试'
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '-1': '计划中',
    '0': '进行中',
    '1': '已完成',
    '2': '已取消'
  }
  return statusMap[status] || '未知'
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 编辑任务
const editTodo = () => {
  // 这里可以实现编辑功能
  console.log('编辑任务:', todo.value.id)
}

// 删除任务
const deleteTodo = async () => {
  if (!confirm('确定要删除这个任务吗？')) return
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/todos/${todo.value.id}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token.value}`
      }
    })
    
    if (response.status === 200) {
      alert('任务删除成功')
      router.push('/home')
    } else {
      alert('删除失败: ' + response.data.message)
    }
  } catch (err) {
    console.error('删除任务失败:', err)
    alert('删除任务失败，请重试')
  }
}

// 强制清除所有登录数据
const forceLogout = () => {
  authStore.forceLogout()
}
</script>

<style scoped>
</style>