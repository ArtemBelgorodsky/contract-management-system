<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Мои договоры</h1>
          <p class="text-neutral-darker mt-2">{{ contracts.length }} договоров в системе</p>
        </div>
        <RouterLink
          to="/contracts/new"
          class="btn-primary inline-block text-center"
        >
          ➕ Новый договор
        </RouterLink>
      </div>

      <!-- Фильтры -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="input-label">Поиск</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ФИО, название курса..."
                class="input-field"
              />
            </div>

            <div>
              <label class="input-label">Статус</label>
              <select
                v-model="selectedStatus"
                class="input-field"
              >
                <option value="">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="submitted">На проверке</option>
                <option value="approved">Одобрено</option>
                <option value="rejected">Отклонено</option>
              </select>
            </div>

            <div class="flex items-end gap-2">
              <button
                @click="applyFilters"
                class="flex-1 btn-primary"
              >
                Применить
              </button>
              <button
                @click="clearFilters"
                class="btn-secondary"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Список договоров -->
      <div class="space-y-4">
        <div v-if="filteredContracts.length === 0" class="card">
          <div class="card-body py-12 text-center">
            <div class="text-6xl mb-4">📭</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Договоров не найдено</h3>
            <p class="text-neutral-darker mb-6">
              {{ contracts.length === 0 ? 'Создайте первый договор' : 'По вашему запросу договоров не найдено' }}
            </p>
            <RouterLink
              to="/contracts/new"
              class="btn-primary inline-block"
            >
              Создать договор
            </RouterLink>
          </div>
        </div>

        <div
          v-for="contract in filteredContracts"
          :key="contract.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="$router.push(`/contracts/${contract.id}`)"
        >
          <div class="card-body">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900">{{ contract.courseTitle }}</h3>
                <p class="text-neutral-darker text-sm mt-1">
                  {{ contract.studentFullName }} • {{ contract.typeName }}
                </p>
              </div>
              <span :class="getStatusBadgeClass(contract.status)" class="badge whitespace-nowrap">
                {{ getStatusLabel(contract.status) }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b border-neutral-dark">
              <div>
                <p class="text-xs text-neutral-darker font-medium">Номер договора</p>
                <p class="text-sm font-semibold text-gray-900">{{ contract.contractNumber || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Продолжительность</p>
                <p class="text-sm font-semibold text-gray-900">{{ contract.courseDuration }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Стоимость</p>
                <p class="text-sm font-semibold text-gray-900">{{ contract.coursePrice }} ₽</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Дата создания</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(contract.createdAt) }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div v-if="contract.rejectionReason" class="flex items-start gap-2 text-red-600 text-sm">
                <span>⚠️</span>
                <span>{{ contract.rejectionReason }}</span>
              </div>
              <div v-else class="text-neutral-darker text-sm">
                <span v-if="contract.fileData">📎 Файл загружен</span>
                <span v-else class="text-red-500">⚠️ Файл не загружен</span>
              </div>

              <div class="flex gap-2">
                <button
                  v-if="contract.status === 'draft'"
                  @click.stop="$router.push(`/contracts/${contract.id}/edit`)"
                  class="px-3 py-1 bg-primary-light text-primary-dark rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  Редактировать
                </button>
                <button
                  v-if="contract.status === 'draft'"
                  @click.stop="submitContract(contract.id)"
                  :disabled="isSubmitting"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {{ isSubmitting ? '⏳' : '✓' }} Отправить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useContractsStore } from '@/stores/contractsStore'
import Header from '@/components/Header.vue'
import type { ContractStatus } from '@/types'

const authStore = useAuthStore()
const contractsStore = useContractsStore()

const searchQuery = ref('')
const selectedStatus = ref('')
const isSubmitting = ref(false)

const contracts = computed(() => {
  return contractsStore.getUserContracts(authStore.currentUser?.id || '')
})

const filteredContracts = computed(() => {
  let result = contracts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.studentFullName.toLowerCase().includes(query) ||
      c.courseTitle.toLowerCase().includes(query) ||
      c.contractNumber.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    result = result.filter(c => c.status === selectedStatus.value)
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const applyFilters = () => {
  contractsStore.setFilters({
    search: searchQuery.value,
    status: selectedStatus.value as ContractStatus | undefined
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  contractsStore.clearFilters()
}

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

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const submitContract = async (contractId: string) => {
  isSubmitting.value = true
  try {
    await contractsStore.submitContract(contractId)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  contractsStore.fetchContracts()
})
</script>
