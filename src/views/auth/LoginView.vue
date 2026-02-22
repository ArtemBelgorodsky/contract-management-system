<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral via-white to-primary-light flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-4">
          <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold">
            📋
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Система учета договоров</h1>
        <p class="text-neutral-darker">Дополнительного образования кафедры</p>
      </div>

      <!-- Форма входа -->
      <div class="card mb-6">
        <div class="card-body">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Вход в систему</h2>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Email -->
            <div class="form-group">
              <label class="input-label">Email адрес</label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="your@email.com"
                class="input-field"
                required
              />
            </div>

            <!-- Пароль -->
            <div class="form-group">
              <label class="input-label">Пароль</label>
              <input
                v-model="formData.password"
                type="password"
                placeholder="Введите пароль"
                class="input-field"
                required
              />
              <p class="text-sm text-neutral-darker mt-2">
                💡 Для демо используйте любой пароль
              </p>
            </div>

            <!-- Сообщение об ошибке -->
            <div v-if="error" class="alert alert-danger text-sm">
              <span>⚠️</span>
              <span>{{ error }}</span>
            </div>

            <!-- Кнопка входа -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Загрузка...</span>
              <span v-else>Войти</span>
            </button>
          </form>

          <!-- Разделитель -->
          <div class="flex items-center gap-4 my-6">
            <div class="flex-1 h-px bg-neutral-dark"></div>
            <span class="text-sm text-neutral-darker">или</span>
            <div class="flex-1 h-px bg-neutral-dark"></div>
          </div>

          <!-- Демо аккаунты -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-900 mb-3">Попробовать с демо аккаунтом:</p>
            <button
              @click="() => quickLogin('admin@edu.ru')"
              type="button"
              class="w-full px-4 py-2 text-sm bg-primary-light text-primary-dark border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              👤 Администратор
            </button>
            <button
              @click="() => quickLogin('user@edu.ru')"
              type="button"
              class="w-full px-4 py-2 text-sm bg-primary-light text-primary-dark border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              👥 Пользователь
            </button>
          </div>
        </div>
      </div>

      <!-- Ссылка на регистрацию -->
      <div class="text-center">
        <p class="text-gray-700">
          Нет аккаунта?
          <RouterLink to="/register" class="text-primary font-semibold hover:text-primary-dark">
            Зарегистрироваться
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await authStore.login(formData.email, formData.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка входа'
  } finally {
    isLoading.value = false
  }
}

const quickLogin = async (email: string) => {
  formData.email = email
  formData.password = 'password'
  await new Promise(resolve => setTimeout(resolve, 300))
  await handleLogin()
}
</script>
