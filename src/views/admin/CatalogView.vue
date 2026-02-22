<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Каталог типов договоров</h1>
          <p class="text-neutral-darker mt-2">Управляйте доступными типами договоров в системе</p>
        </div>
        <RouterLink
          to="/admin/catalog/new"
          class="btn-primary inline-block text-center"
        >
          ➕ Новый тип
        </RouterLink>
      </div>

      <!-- Сообщения -->
      <div v-if="success" class="alert alert-success mb-6">
        <span>✓</span>
        <span>{{ success }}</span>
      </div>

      <div v-if="error" class="alert alert-danger mb-6">
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- Таблица типов -->
      <div class="card">
        <div v-if="contractTypes.length === 0" class="card-body py-12 text-center">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-neutral-darker mb-6">Типов договоров не найдено</p>
          <RouterLink
            to="/admin/catalog/new"
            class="btn-primary inline-block"
          >
            Создать первый тип
          </RouterLink>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-light border-b border-neutral-dark">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Название</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Описание</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Обязательные поля</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Договоров</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-dark">
              <tr
                v-for="type in contractTypes"
                :key="type.id"
                class="hover:bg-neutral transition-colors"
              >
                <td class="px-6 py-4">
                  <p class="font-semibold text-gray-900">{{ type.name }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm text-neutral-darker">{{ type.description }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="field in type.requiredFields.slice(0, 2)"
                      :key="field"
                      class="badge badge-primary text-xs"
                    >
                      {{ getFieldLabel(field) }}
                    </span>
                    <span
                      v-if="type.requiredFields.length > 2"
                      class="text-xs text-neutral-darker"
                    >
                      и еще {{ type.requiredFields.length - 2 }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="badge badge-primary">{{ getContractCount(type.id) }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <RouterLink
                      :to="`/admin/catalog/${type.id}/edit`"
                      class="px-3 py-1 text-sm bg-primary-light text-primary-dark rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
                    >
                      Редактировать
                    </RouterLink>
                    <button
                      @click="deleteType(type.id, type.name)"
                      :disabled="isDeleting"
                      class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Справка -->
      <div class="card mt-6">
        <div class="card-header">
          <h2 class="text-lg font-bold text-gray-900">ℹ️ Рекомендации</h2>
        </div>
        <div class="card-body space-y-3 text-sm text-neutral-darker">
          <p>
            <span class="font-semibold text-gray-900">Обязательные поля:</span>
            Выбирайте только действительно необходимые поля для заполнения договора данного типа.
          </p>
          <p>
            <span class="font-semibold text-gray-900">Описание:</span>
            Напишите четкое и понятное описание типа договора для пользователей.
          </p>
          <p>
            <span class="font-semibold text-gray-900">Удаление:</span>
            Будьте осторожны при удалении типов договоров - существующие договора остаются в системе.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCatalogStore } from '@/stores/catalogStore'
import { useContractsStore } from '@/stores/contractsStore'
import { useAuditStore } from '@/stores/auditStore'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/authStore'

const catalogStore = useCatalogStore()
const contractsStore = useContractsStore()
const auditStore = useAuditStore()
const authStore = useAuthStore()

const success = ref('')
const error = ref('')
const isDeleting = ref(false)

const contractTypes = computed(() => catalogStore.contractTypes)

const getContractCount = (typeId: string) => {
  return contractsStore.contracts.filter(c => c.typeId === typeId).length
}

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    studentFullName: 'ФИО студента',
    studentEmail: 'Email',
    studentPhone: 'Телефон',
    courseTitle: 'Название курса',
    courseDuration: 'Продолжительность',
    coursePrice: 'Стоимость'
  }
  return labels[field] || field
}

const deleteType = async (typeId: string, typeName: string) => {
  if (!confirm(`Удалить тип договора "${typeName}"?`)) return

  isDeleting.value = true
  try {
    await catalogStore.deleteContractType(typeId)
    
    auditStore.addAuditLog({
      adminId: authStore.currentUser?.id || '',
      adminName: authStore.currentUser?.fullName || 'Unknown',
      action: 'delete',
      entityType: 'contract_type',
      entityId: typeId,
      details: `Удален тип договора: "${typeName}"`
    })

    success.value = 'Тип договора удален'
    setTimeout(() => (success.value = ''), 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка удаления'
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  catalogStore.fetchContractTypes()
  contractsStore.fetchContracts()
})
</script>
