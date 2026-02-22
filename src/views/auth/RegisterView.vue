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

      <!-- Форма регистрации -->
      <div class="card mb-6">
        <div class="card-body">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Регистрация</h2>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- ФИО -->
            <div class="form-group">
              <label class="input-label">Полное имя</label>
              <input
                v-model="formData.fullName"
                type="text"
                placeholder="Иван Петрович Сидоров"
                class="input-field"
                required
              />
            </div>

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

            <!-- Телефон -->
            <div class="form-group">
              <label class="input-label">Номер телефона (опционально)</label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="+7 (900) 123-45-67"
                class="input-field"
              />
            </div>

            <!-- Пароль -->
            <div class="form-group">
              <label class="input-label">Пароль</label>
              <input
                v-model="formData.password"
                type="password"
                placeholder="Минимум 6 символов"
                class="input-field"
                required
                minlength="6"
              />
            </div>

            <!-- Подтверждение пароля -->
            <div class="form-group">
              <label class="input-label">Подтвердите пароль</label>
              <input
                v-model="formData.confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                class="input-field"
                required
              />
            </div>

            <!-- Сообщение об ошибке -->
            <div v-if="error" class="alert alert-danger text-sm">
              <span>⚠️</span>
              <span>{{ error }}</span>
            </div>

            <!-- Кнопка регистрации -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Загрузка...</span>
              <span v-else>Зарегистрироваться</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Ссылка на вход -->
      <div class="text-center">
        <p class="text-gray-700">
          Уже есть аккаунт?
          <RouterLink to="/login" class="text-primary font-semibold hover:text-primary-dark">
            Войти
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
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  // Валидация
  if (!formData.fullName || !formData.email || !formData.password) {
    error.value = 'Заполните все обязательные поля'
    return
  }

  if (formData.password !== formData.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }

  if (formData.password.length < 6) {
    error.value = 'Пароль должен содержать минимум 6 символов'
    return
  }

  isLoading.value = true

  try {
    await authStore.register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    )
    router.push('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка регистрации'
  } finally {
    isLoading.value = false
  }
}
</script>
