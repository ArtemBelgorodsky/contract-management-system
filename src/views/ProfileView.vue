<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Мой профиль</h1>
        <p class="text-neutral-darker mt-2">Информация о вашем аккаунте</p>
      </div>

      <!-- Информация профиля -->
      <div class="card mb-6">
        <div class="card-header">
          <h2 class="text-xl font-bold text-gray-900">👤 Личная информация</h2>
        </div>

        <div class="card-body space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="input-label">Полное имя</label>
              <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                {{ currentUser?.fullName }}
              </div>
            </div>

            <div>
              <label class="input-label">Email</label>
              <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                {{ currentUser?.email }}
              </div>
            </div>

            <div>
              <label class="input-label">Телефон</label>
              <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                {{ currentUser?.phone || 'Не указан' }}
              </div>
            </div>

            <div>
              <label class="input-label">Роль</label>
              <div class="flex items-center gap-2">
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ getRoleLabel(currentUser?.role || 'user') }}
                </div>
                <span :class="getRoleBadgeClass(currentUser?.role || 'user')" class="badge">
                  {{ currentUser?.role }}
                </span>
              </div>
            </div>

            <div>
              <label class="input-label">Дата регистрации</label>
              <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                {{ formatDate(currentUser?.createdAt || new Date()) }}
              </div>
            </div>

            <div>
              <label class="input-label">ID пользователя</label>
              <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium font-mono text-sm">
                {{ currentUser?.id }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика пользователя -->
      <div v-if="!isAdmin" class="card mb-6">
        <div class="card-header">
          <h2 class="text-xl font-bold text-gray-900">📊 Ваша статистика</h2>
        </div>

        <div class="card-body">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-primary">{{ contractStats.total }}</div>
              <p class="text-sm text-neutral-darker mt-2">Договоров создано</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500">{{ contractStats.approved }}</div>
              <p class="text-sm text-neutral-darker mt-2">Одобрено</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-500">{{ contractStats.submitted }}</div>
              <p class="text-sm text-neutral-darker mt-2">На проверке</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-500">{{ contractStats.rejected }}</div>
              <p class="text-sm text-neutral-darker mt-2">Отклонено</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Безопасность -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-bold text-gray-900">🔐 Аккаунт</h2>
        </div>

        <div class="card-body space-y-4">
          

          <button
            @click="handleLogout"
            class="btn-danger"
          >
            🚪 Выйти из аккаунта
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useContractsStore } from '@/stores/contractsStore'
import Header from '@/components/Header.vue'
import type { UserRole } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const contractsStore = useContractsStore()

const currentUser = computed(() => authStore.currentUser)
const isAdmin = computed(() => authStore.isAdmin)

const userContracts = computed(() => {
  return contractsStore.getUserContracts(currentUser.value?.id || '')
})

const contractStats = computed(() => {
  return {
    total: userContracts.value.length,
    approved: userContracts.value.filter(c => c.status === 'approved').length,
    submitted: userContracts.value.filter(c => c.status === 'submitted').length,
    rejected: userContracts.value.filter(c => c.status === 'rejected').length
  }
})

const getRoleLabel = (role: UserRole) => {
  const labels: Record<UserRole, string> = {
    admin: 'Администратор',
    user: 'Пользователь'
  }
  return labels[role]
}

const getRoleBadgeClass = (role: UserRole) => {
  return role === 'admin' ? 'badge-primary' : 'badge-success'
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
