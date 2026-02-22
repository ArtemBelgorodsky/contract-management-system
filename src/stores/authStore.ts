import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'

// Мок данные пользователей
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin@edu.ru',
    email: 'admin@edu.ru',
    fullName: 'Администратор Системы',
    role: 'admin',
    phone: '+7 (900) 123-45-67',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    username: 'user@edu.ru',
    email: 'user@edu.ru',
    fullName: 'Иван Петров',
    role: 'user',
    phone: '+7 (900) 987-65-43',
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    username: 'teacher@edu.ru',
    email: 'teacher@edu.ru',
    fullName: 'Мария Сидорова',
    role: 'user',
    phone: '+7 (900) 555-55-55',
    createdAt: new Date('2024-01-20')
  }
]

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // Имитируем сетевой запрос
      await new Promise(resolve => setTimeout(resolve, 800))

      // Проверяем по email (в демо пароль любой)
      const user = mockUsers.find(u => u.email === email)
      if (!user) {
        throw new Error('Пользователь не найден')
      }

      currentUser.value = user
      localStorage.setItem('currentUser', JSON.stringify(user))
      return user
    } finally {
      isLoading.value = false
    }
  }

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Проверяем, не существует ли уже пользователь
      if (mockUsers.find(u => u.email === email)) {
        throw new Error('Пользователь с этим email уже существует')
      }

      // Создаем нового пользователя
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username: email,
        email,
        fullName,
        phone,
        role: 'user',
        createdAt: new Date()
      }

      mockUsers.push(newUser)
      currentUser.value = newUser
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      return newUser
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const restoreSession = () => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      currentUser.value = JSON.parse(stored)
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    restoreSession
  }
})
