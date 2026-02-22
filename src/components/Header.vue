<template>
  <header class="bg-white border-b border-neutral-dark shadow-soft sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Логотип и название -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-lg font-bold">
            📋
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">ИС Договоры</h1>
            
          </div>
        </div>

        <!-- Навигация -->
        <nav class="hidden md:flex items-center gap-8">
          <RouterLink
            v-if="!isAdmin"
            to="/dashboard"
            class="text-gray-700 hover:text-primary transition-colors font-medium"
            :class="{ 'text-primary border-b-2 border-primary': route.path === '/dashboard' }"
          >
            Главная
          </RouterLink>

          <RouterLink
            v-if="!isAdmin"
            to="/contracts"
            class="text-gray-700 hover:text-primary transition-colors font-medium"
            :class="{ 'text-primary border-b-2 border-primary': isContractsActive }"
          >
            Мои договоры
          </RouterLink>

          <template v-if="isAdmin">
            <RouterLink
              to="/admin"
              class="text-gray-700 hover:text-primary transition-colors font-medium"
              :class="{ 'text-primary border-b-2 border-primary': isAdminActive }"
            >
              Админ-панель
            </RouterLink>
            <RouterLink
              to="/admin/catalog"
              class="text-gray-700 hover:text-primary transition-colors font-medium"
              :class="{ 'text-primary border-b-2 border-primary': isCatalogActive }"
            >
              Каталог
            </RouterLink>
          </template>
        </nav>

        <!-- Правая часть -->
        <div class="flex items-center gap-4">
          <!-- Уведомления -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="relative p-2 text-neutral-darker hover:text-primary transition-colors"
            >
              🔔
              <span
                v-if="unreadCount > 0"
                class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {{ unreadCount }}
              </span>
            </button>

            <!-- Меню уведомлений -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-dark overflow-hidden z-50"
            >
              <div class="p-4 border-b border-neutral-dark bg-primary-light">
                <h3 class="font-bold text-gray-900">Уведомления</h3>
              </div>

              <div class="max-h-96 overflow-y-auto">
                <div v-if="userNotifications.length === 0" class="p-4 text-center text-neutral-darker">
                  Нет новых уведомлений
                </div>

                <div
                  v-for="notif in userNotifications.slice(0, 5)"
                  :key="notif.id"
                  class="px-4 py-3 border-b border-neutral-dark hover:bg-neutral transition-colors cursor-pointer"
                  @click="handleNotificationClick(notif)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ notif.message }}</p>
                      <p class="text-xs text-neutral-darker mt-1">
                        {{ formatDate(notif.createdAt) }}
                      </p>
                    </div>
                    <button
                      @click.stop="auditStore.deleteNotification(notif.id)"
                      class="text-neutral-darker hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Меню пользователя -->
          <div class="relative">
            <button
              @click="showMenu = !showMenu"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral transition-colors"
            >
              <span class="text-lg">👤</span>
              <span class="hidden sm:inline text-sm font-medium text-gray-900">{{ userName }}</span>
              <span class="text-lg">▼</span>
            </button>

            <!-- Выпадающее меню -->
            <div
              v-if="showMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-dark overflow-hidden z-50"
            >
              <RouterLink
                to="/profile"
                class="block px-4 py-2 text-gray-700 hover:bg-neutral transition-colors"
              >
                👤 Профиль
              </RouterLink>

              <div class="border-t border-neutral-dark"></div>

              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                🚪 Выход
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAuditStore } from '@/stores/auditStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const auditStore = useAuditStore()

const showMenu = ref(false)
const showNotifications = ref(false)

const userName = computed(() => authStore.currentUser?.fullName?.split(' ')[0] || 'User')
const isAdmin = computed(() => authStore.isAdmin)

const userNotifications = computed(() => {
  return auditStore.getNotificationsByUser(authStore.currentUser?.id || '')
})

const unreadCount = computed(() => {
  return userNotifications.value.filter(n => !n.read).length
})

const isContractsActive = computed(() => route.name === 'ContractsList')
const isAdminActive = computed(() => route.name === 'AdminDashboard')
const isCatalogActive = computed(() => route.name === 'AdminCatalog' || route.name === 'AdminAllContracts')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleNotificationClick = (notif: any) => {
  auditStore.markAsRead(notif.id)
  if (notif.actionUrl) {
    router.push(notif.actionUrl)
  }
  showNotifications.value = false
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours}ч назад`
  if (days < 7) return `${days}д назад`

  return new Date(date).toLocaleDateString('ru-RU')
}

// Закрываем меню при клике вне
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('button')) {
    showMenu.value = false
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
