<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Проверка договоров</h1>
        <p class="text-neutral-darker mt-2">Просмотр и утверждение договоров пользователей</p>
      </div>

      <!-- Фильтры -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="input-label">Фильтр по статусу</label>
              <select
                v-model="selectedStatus"
                @change="applyFilters"
                class="input-field"
              >
                <option value="">Все статусы</option>
                <option value="submitted">На проверке</option>
                <option value="approved">Одобрено</option>
                <option value="rejected">Отклонено</option>
              </select>
            </div>

            <div>
              <label class="input-label">Поиск</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ФИО студента, название курса..."
                class="input-field"
                @input="applyFilters"
              />
            </div>

            <div class="flex items-end gap-2">
              <button
                @click="clearFilters"
                class="btn-secondary"
              >
                Сбросить фильтры
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
            <p class="text-neutral-darker">Договоров не найдено</p>
          </div>
        </div>

        <div
          v-for="contract in filteredContracts"
          :key="contract.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="card-body space-y-4">
            <!-- Заголовок -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-dark">
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ contract.courseTitle }}</h3>
                <p class="text-neutral-darker text-sm mt-1">
                  {{ contract.studentFullName }} • {{ contract.typeName }}
                </p>
              </div>
              <span :class="getStatusBadgeClass(contract.status)" class="badge whitespace-nowrap">
                {{ getStatusLabel(contract.status) }}
              </span>
            </div>

            <!-- Информация -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p class="text-xs text-neutral-darker font-medium">Номер договора</p>
                <p class="font-semibold text-gray-900">{{ contract.contractNumber }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Email студента</p>
                <p class="font-semibold text-gray-900">{{ contract.studentEmail }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Стоимость</p>
                <p class="font-semibold text-gray-900">{{ contract.coursePrice }} ₽</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Дата подачи</p>
                <p class="font-semibold text-gray-900">
                  {{ contract.submittedAt ? formatDate(contract.submittedAt) : '—' }}
                </p>
              </div>
            </div>

            <!-- Файл -->
            <div v-if="contract.fileData" class="flex items-center justify-between p-3 bg-primary-light rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-xl">📄</span>
                <div>
                  <p class="font-medium text-gray-900">{{ contract.fileData.name }}</p>
                  <p class="text-xs text-neutral-darker">{{ formatFileSize(contract.fileData.size) }}</p>
                </div>
              </div>
              <button
                @click="downloadFile(contract)"
                class="px-3 py-1 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                ⬇️ Скачать
              </button>
            </div>

            <!-- Действия для договоров на проверке -->
            <div v-if="contract.status === 'submitted' || contract.status === 'rejected'" class="space-y-3 pt-2 border-t border-neutral-dark">
              <div class="form-group">
                <label class="input-label text-sm">Комментарий администратора</label>
                <textarea
                  v-model="comments[contract.id]"
                  placeholder="Введите комментарий к договору"
                  class="input-field resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div class="flex gap-2 justify-end">
                <button
                  @click="rejectContract(contract.id)"
                  :disabled="isProcessing"
                  class="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  ❌ Отклонить
                </button>
                <button
                  @click="approveContract(contract.id)"
                  :disabled="isProcessing"
                  class="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  ✓ Одобрить
                </button>
              </div>
            </div>

            <!-- Статус завершенных договоров -->
            <div v-else class="space-y-2 pt-2 border-t border-neutral-dark text-sm">
              <div v-if="contract.status === 'approved'" class="flex items-start gap-2 text-green-600">
                <span>✓</span>
                <div>
                  <p class="font-medium">Одобрено</p>
                  <p class="text-xs">{{ formatDate(contract.approvedAt || new Date()) }}</p>
                </div>
              </div>
              <div v-if="contract.rejectionReason" class="flex items-start gap-2 text-red-600">
                <span>❌</span>
                <div>
                  <p class="font-medium">Причина отклонения:</p>
                  <p class="text-xs">{{ contract.rejectionReason }}</p>
                </div>
              </div>
              <div v-if="contract.adminComment" class="flex items-start gap-2 text-blue-600">
                <span>💬</span>
                <div>
                  <p class="font-medium">Комментарий:</p>
                  <p class="text-xs">{{ contract.adminComment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useContractsStore } from '@/stores/contractsStore'
import { useAuditStore } from '@/stores/auditStore'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/Header.vue'
import type { ContractStatus } from '@/types'

const contractsStore = useContractsStore()
const auditStore = useAuditStore()
const authStore = useAuthStore()

const selectedStatus = ref('')
const searchQuery = ref('')
const isProcessing = ref(false)
const comments = reactive<Record<string, string>>({})

const contracts = computed(() => contractsStore.contracts)

const filteredContracts = computed(() => {
  let result = contracts.value

  // Исключаем черновики из списка для администратора
  result = result.filter(c => c.status !== 'draft')

  if (selectedStatus.value) {
    result = result.filter(c => c.status === selectedStatus.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.studentFullName.toLowerCase().includes(query) ||
      c.courseTitle.toLowerCase().includes(query) ||
      c.contractNumber.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => {
    // На проверке в первую очередь
    if (a.status === 'submitted' && b.status !== 'submitted') return -1
    if (a.status !== 'submitted' && b.status === 'submitted') return 1
    return new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
  })
})

const applyFilters = () => {
  // Filters are applied via computed property
}

const clearFilters = () => {
  selectedStatus.value = ''
  searchQuery.value = ''
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const downloadFile = (contract: any) => {
  if (!contract.fileData) return

  const link = document.createElement('a')
  link.href = `data:${contract.fileData.type};base64,${contract.fileData.content}`
  link.download = contract.fileData.name
  link.click()
}

const approveContract = async (contractId: string) => {
  isProcessing.value = true
  try {
    const comment = comments[contractId] || ''
    await contractsStore.approveContract(contractId, comment)

    const contract = contractsStore.getContractById(contractId)
    if (contract) {
      auditStore.addAuditLog({
        adminId: authStore.currentUser?.id || '',
        adminName: authStore.currentUser?.fullName || 'Unknown',
        action: 'approve',
        entityType: 'contract',
        entityId: contractId,
        details: `Одобрен договор: "${contract.courseTitle}"`
      })

      auditStore.addNotification({
        userId: contract.userId,
        message: `Ваш договор №${contract.contractNumber} успешно одобрен`,
        type: 'success',
        read: false,
        actionUrl: `/contracts/${contractId}`
      })
    }

    comments[contractId] = ''
  } finally {
    isProcessing.value = false
  }
}

const rejectContract = async (contractId: string) => {
  const reason = prompt('Введите причину отклонения договора:')
  if (!reason) return

  isProcessing.value = true
  try {
    await contractsStore.rejectContract(contractId, reason)

    const contract = contractsStore.getContractById(contractId)
    if (contract) {
      auditStore.addAuditLog({
        adminId: authStore.currentUser?.id || '',
        adminName: authStore.currentUser?.fullName || 'Unknown',
        action: 'reject',
        entityType: 'contract',
        entityId: contractId,
        details: `Отклонен договор: "${contract.courseTitle}". Причина: ${reason}`
      })

      auditStore.addNotification({
        userId: contract.userId,
        message: `Ваш договор №${contract.contractNumber} отклонен. Причина: ${reason}`,
        type: 'warning',
        read: false,
        actionUrl: `/contracts/${contractId}`
      })
    }

    comments[contractId] = ''
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  contractsStore.fetchContracts()
})
</script>
