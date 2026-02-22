<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Приветствие -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          👋 Добро пожаловать, {{ userName }}!
        </h1>
        <p class="text-neutral-darker mt-2">
          {{ isAdmin ? 'Панель управления системой договоров' : 'Управляйте своими договорами дополнительного образования' }}
        </p>
      </div>

      <!-- Для администратора -->
      <template v-if="isAdmin">
        <!-- Статистика -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="card-body text-center">
              <div class="text-4xl font-bold text-primary mb-2">{{ stats.total }}</div>
              <p class="text-neutral-darker font-medium">Всего договоров</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body text-center">
              <div class="text-4xl font-bold text-green-500 mb-2">{{ stats.byStatus.approved }}</div>
              <p class="text-neutral-darker font-medium">Одобрено</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body text-center">
              <div class="text-4xl font-bold text-yellow-500 mb-2">{{ stats.byStatus.submitted }}</div>
              <p class="text-neutral-darker font-medium">На проверке</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body text-center">
              <div class="text-4xl font-bold text-red-500 mb-2">{{ stats.byStatus.rejected }}</div>
              <p class="text-neutral-darker font-medium">Отклонено</p>
            </div>
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RouterLink
            to="/admin/contracts"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="card-body">
              <div class="text-4xl mb-3">📊</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Просмотр договоров</h3>
              <p class="text-neutral-darker text-sm">Рассмотрите и одобрите договоры пользователей</p>
            </div>
          </RouterLink>

          <RouterLink
            to="/admin/catalog"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="card-body">
              <div class="text-4xl mb-3">📚</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Управление каталогом</h3>
              <p class="text-neutral-darker text-sm">Добавляйте и редактируйте типы договоров</p>
            </div>
          </RouterLink>
        </div>

        <!-- История действий -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-bold text-gray-900">📋 История действий</h3>
          </div>
          <div class="divide-y divide-neutral-dark">
            <div
              v-for="log in auditLogs.slice(0, 5)"
              :key="log.id"
              class="px-6 py-4 flex items-center justify-between hover:bg-neutral transition-colors"
            >
              <div>
                <p class="font-medium text-gray-900">{{ getActionLabel(log.action) }}</p>
                <p class="text-sm text-neutral-darker">
                  {{ log.adminName }} • {{ formatDate(log.timestamp) }}
                </p>
              </div>
              <span class="badge" :class="getActionBadgeClass(log.action)">
                {{ getActionLabel(log.action) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Для обычного пользователя -->
      <template v-else>
        <!-- Быстрые действия -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RouterLink
            to="/contracts"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="card-body">
              <div class="text-4xl mb-3">📄</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Мои договоры</h3>
              <p class="text-neutral-darker text-sm">Просмотрите список своих договоров</p>
            </div>
          </RouterLink>

          <RouterLink
            to="/contracts/new"
            class="card hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary-light to-white"
          >
            <div class="card-body">
              <div class="text-4xl mb-3">➕</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Создать договор</h3>
              <p class="text-neutral-darker text-sm">Добавьте новый договор дополнительного образования</p>
            </div>
          </RouterLink>
        </div>

        <!-- Статистика контрактов пользователя -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-primary">{{ userStats.total }}</div>
              <p class="text-sm text-neutral-darker mt-1">Всего договоров</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-blue-500">{{ userStats.draft }}</div>
              <p class="text-sm text-neutral-darker mt-1">Черновик</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-yellow-500">{{ userStats.submitted }}</div>
              <p class="text-sm text-neutral-darker mt-1">На проверке</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-green-500">{{ userStats.approved }}</div>
              <p class="text-sm text-neutral-darker mt-1">Одобрено</p>
            </div>
          </div>
        </div>

        <!-- Последние договоры -->
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">📋 Ваши последние договоры</h3>
            <RouterLink
              to="/contracts"
              class="text-primary hover:text-primary-dark text-sm font-medium"
            >
              Все договоры →
            </RouterLink>
          </div>

          <div v-if="recentContracts.length === 0" class="card-body text-center py-8">
            <div class="text-5xl mb-4">📭</div>
            <p class="text-neutral-darker mb-4">У вас еще нет договоров</p>
            <RouterLink
              to="/contracts/new"
              class="inline-block btn-primary"
            >
              Создать первый договор
            </RouterLink>
          </div>

          <div v-else class="divide-y divide-neutral-dark">
            <div
              v-for="contract in recentContracts"
              :key="contract.id"
              class="px-6 py-4 flex items-center justify-between hover:bg-neutral transition-colors cursor-pointer"
              @click="$router.push(`/contracts/${contract.id}`)"
            >
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ contract.courseTitle }}</p>
                <p class="text-sm text-neutral-darker">
                  {{ contract.studentFullName }} • {{ contract.typeName }}
                </p>
              </div>
              <span :class="getStatusBadgeClass(contract.status)" class="badge ml-4">
                {{ getStatusLabel(contract.status) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useContractsStore } from '@/stores/contractsStore'
import { useAuditStore } from '@/stores/auditStore'
import Header from '@/components/Header.vue'
import type { ContractStatus } from '@/types'

const authStore = useAuthStore()
const contractsStore = useContractsStore()
const auditStore = useAuditStore()

const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.currentUser?.fullName?.split(' ')[0] || 'User')

const stats = computed(() => contractsStore.getContractStats())

const auditLogs = computed(() => auditStore.auditLogs)

const userContracts = computed(() => {
  return contractsStore.getUserContracts(authStore.currentUser?.id || '')
})

const userStats = computed(() => {
  return {
    total: userContracts.value.length,
    draft: userContracts.value.filter(c => c.status === 'draft').length,
    submitted: userContracts.value.filter(c => c.status === 'submitted').length,
    approved: userContracts.value.filter(c => c.status === 'approved').length,
    rejected: userContracts.value.filter(c => c.status === 'rejected').length
  }
})

const recentContracts = computed(() => {
  return userContracts.value
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

const getStatusLabel = (status: ContractStatus) => {
  const labels: Record<ContractStatus, string> = {
    draft: 'Черновик',
    submitted: 'На проверке',
    approved: 'Одобрено',
    rejected: 'Отклонено'
  }
  return labels[status]
}

const getStatusBadgeClass = (status: ContractStatus) => {
  const classes: Record<ContractStatus, string> = {
    draft: 'badge-primary',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved: 'badge-success',
    rejected: 'badge-danger'
  }
  return classes[status]
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: 'Создан новый тип договора',
    update: 'Тип договора обновлен',
    delete: 'Тип договора удален',
    approve: 'Договор одобрен',
    reject: 'Договор отклонен'
  }
  return labels[action] || action
}

const getActionBadgeClass = (action: string) => {
  if (['approve', 'create', 'update'].includes(action)) {
    return 'badge-success'
  }
  if (action === 'reject' || action === 'delete') {
    return 'badge-danger'
  }
  return 'badge-primary'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  contractsStore.fetchContracts()
})
</script>
