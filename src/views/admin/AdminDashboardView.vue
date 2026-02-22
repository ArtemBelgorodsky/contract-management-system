<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Админ-панель</h1>
        <p class="text-neutral-darker mt-2">Управление системой договоров дополнительного образования</p>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div class="card">
          <div class="card-body text-center">
            <div class="text-4xl font-bold text-primary mb-2">{{ stats.total }}</div>
            <p class="text-sm text-neutral-darker">Всего договоров</p>
          </div>
        </div>

        <div class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-green-500 mb-2">{{ stats.byStatus.approved }}</div>
            <p class="text-sm text-neutral-darker">Одобрено</p>
          </div>
        </div>

        <div class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-yellow-500 mb-2">{{ stats.byStatus.submitted }}</div>
            <p class="text-sm text-neutral-darker">На проверке</p>
          </div>
        </div>

        <div class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-red-500 mb-2">{{ stats.byStatus.rejected }}</div>
            <p class="text-sm text-neutral-darker">Отклонено</p>
          </div>
        </div>

        <div class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-blue-500 mb-2">{{ stats.byStatus.draft }}</div>
            <p class="text-sm text-neutral-darker">Черновик</p>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <RouterLink
          to="/admin/contracts"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="card-body">
            <div class="text-4xl mb-3">📋</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Проверка договоров</h3>
            <p class="text-neutral-darker text-sm">
              {{ stats.byStatus.submitted }} договоров ждут проверки
            </p>
          </div>
        </RouterLink>

        <RouterLink
          to="/admin/catalog"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="card-body">
            <div class="text-4xl mb-3">📚</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Каталог типов</h3>
            <p class="text-neutral-darker text-sm">
              {{ catalogTypes.length }} типов договоров
            </p>
          </div>
        </RouterLink>

        <RouterLink
          to="/profile"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="card-body">
            <div class="text-4xl mb-3">👤</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Профиль</h3>
            <p class="text-neutral-darker text-sm">
              Просмотрите информацию профиля
            </p>
          </div>
        </RouterLink>
      </div>

      <!-- История действий администратора -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Последние действия -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">📋 Последние действия</h2>
          </div>
          <div class="divide-y divide-neutral-dark max-h-96 overflow-y-auto">
            <div
              v-if="auditLogs.length === 0"
              class="p-6 text-center text-neutral-darker"
            >
              История действий пуста
            </div>

            <div
              v-for="log in auditLogs.slice(0, 10)"
              :key="log.id"
              class="px-6 py-4 hover:bg-neutral transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="font-medium text-gray-900">{{ getActionLabel(log.action) }}</p>
                <span :class="getActionBadgeClass(log.action)" class="badge text-xs">
                  {{ getEntityTypeLabel(log.entityType) }}
                </span>
              </div>
              <p class="text-xs text-neutral-darker">
                {{ formatDate(log.timestamp) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Статистика типов договоров -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">📊 Типы договоров</h2>
          </div>
          <div class="divide-y divide-neutral-dark max-h-96 overflow-y-auto">
            <div
              v-if="catalogTypes.length === 0"
              class="p-6 text-center text-neutral-darker"
            >
              Типов договоров нет
            </div>

            <div
              v-for="type in catalogTypes"
              :key="type.id"
              class="px-6 py-4 hover:bg-neutral transition-colors flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-gray-900">{{ type.name }}</p>
                <p class="text-xs text-neutral-darker">{{ type.description }}</p>
              </div>
              <span class="badge badge-primary">{{ getContractCountByType(type.id) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Справка -->
      <div class="card mt-6">
        <div class="card-header">
          <h2 class="text-lg font-bold text-gray-900">ℹ️ Справка</h2>
        </div>
        <div class="card-body">
          <div class="space-y-3 text-sm text-neutral-darker">
            <p>
              <span class="font-semibold text-gray-900">Проверка договоров:</span>
              Перейдите в раздел "Проверка договоров" чтобы просмотреть и одобрить/отклонить договоры пользователей.
            </p>
            <p>
              <span class="font-semibold text-gray-900">Управление каталогом:</span>
              В разделе "Каталог типов" вы можете добавлять, редактировать и удалять типы договоров.
            </p>
            <p>
              <span class="font-semibold text-gray-900">История действий:</span>
              Все действия администраторов логируются для аудита и контроля.
            </p>
            <p>
              <span class="font-semibold text-gray-900">Уведомления:</span>
              Пользователи получают уведомления об изменении статуса своих договоров.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useContractsStore } from '@/stores/contractsStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { useAuditStore } from '@/stores/auditStore'
import Header from '@/components/Header.vue'

const contractsStore = useContractsStore()
const catalogStore = useCatalogStore()
const auditStore = useAuditStore()

const stats = computed(() => contractsStore.getContractStats())
const catalogTypes = computed(() => catalogStore.contractTypes)
const auditLogs = computed(() => auditStore.auditLogs)

const getContractCountByType = (typeId: string) => {
  return contractsStore.contracts.filter(c => c.typeId === typeId).length
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: 'Создано',
    update: 'Обновлено',
    delete: 'Удалено',
    approve: 'Одобрено',
    reject: 'Отклонено'
  }
  return labels[action] || action
}

const getEntityTypeLabel = (entityType: string) => {
  const labels: Record<string, string> = {
    contract: 'Договор',
    contract_type: 'Тип договора',
    catalog: 'Каталог'
  }
  return labels[entityType] || entityType
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

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  contractsStore.fetchContracts()
  catalogStore.fetchContractTypes()
})
</script>
