<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Кнопка назад -->
      <button
        @click="$router.back()"
        class="text-primary hover:text-primary-dark font-medium mb-6 flex items-center gap-2"
      >
        ← Вернуться
      </button>

      <div v-if="contract" class="space-y-6">
        <!-- Заголовок и статус -->
        <div class="card">
          <div class="card-body">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ contract.courseTitle }}</h1>
                <p class="text-neutral-darker mt-1">{{ contract.typeName }}</p>
              </div>
              <span :class="getStatusBadgeClass(contract.status)" class="badge text-lg py-2 px-4 whitespace-nowrap">
                {{ getStatusLabel(contract.status) }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-dark">
              <div>
                <p class="text-xs text-neutral-darker font-medium">Номер договора</p>
                <p class="text-lg font-bold text-gray-900">{{ contract.contractNumber }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Дата создания</p>
                <p class="text-lg font-bold text-gray-900">{{ formatDate(contract.createdAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-darker font-medium">Последнее изменение</p>
                <p class="text-lg font-bold text-gray-900">{{ formatDate(contract.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Сообщения об отклонении -->
        <div v-if="contract.status === 'rejected'" class="alert alert-danger">
          <span>⚠️</span>
          <div>
            <p class="font-bold mb-1">Причина отклонения:</p>
            <p>{{ contract.rejectionReason }}</p>
          </div>
        </div>

        <div v-if="contract.adminComment" class="alert alert-info">
          <span>💬</span>
          <div>
            <p class="font-bold mb-1">Комментарий администратора:</p>
            <p>{{ contract.adminComment }}</p>
          </div>
        </div>

        <!-- Информация о студенте -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">Информация о студенте</h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="input-label">Полное имя</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ contract.studentFullName }}
                </div>
              </div>
              <div>
                <label class="input-label">Email</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ contract.studentEmail }}
                </div>
              </div>
              <div>
                <label class="input-label">Телефон</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ contract.studentPhone || '—' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о курсе -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">Информация о курсе</h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="input-label">Название курса</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ contract.courseTitle }}
                </div>
              </div>
              <div>
                <label class="input-label">Стоимость</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ contract.coursePrice }} ₽
                </div>
              </div>
              <div>
                <label class="input-label">Продолжительность</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ contract.courseDuration }}
                </div>
              </div>
              <div>
                <label class="input-label">Период обучения</label>
                <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 font-medium">
                  {{ formatDate(contract.startDate) }} - {{ formatDate(contract.endDate) }}
                </div>
              </div>
            </div>

            <div v-if="contract.additionalInfo">
              <label class="input-label">Дополнительная информация</label>
              <div class="px-4 py-2 bg-neutral rounded-lg text-gray-900 whitespace-pre-wrap">
                {{ contract.additionalInfo }}
              </div>
            </div>
          </div>
        </div>

        <!-- Отсканированный договор -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">Отсканированный договор</h2>
          </div>
          <div class="card-body">
            <div v-if="contract.fileData" class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-primary-light rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">📄</span>
                  <div>
                    <p class="font-medium text-gray-900">{{ contract.fileData.name }}</p>
                    <p class="text-sm text-neutral-darker">{{ formatFileSize(contract.fileData.size) }}</p>
                  </div>
                </div>
                <button
                  @click="downloadFile"
                  class="btn-primary"
                >
                  ⬇️ Скачать
                </button>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <div class="text-4xl mb-2">📭</div>
              <p class="text-neutral-darker">Файл договора не загружен</p>
            </div>
          </div>
        </div>

        <!-- Действия пользователя -->
        <div v-if="contract.status === 'draft'" class="card-footer flex gap-2 justify-between">
          <button
            @click="deleteContract"
            class="btn-danger"
          >
            🗑️ Удалить
          </button>

          <div class="flex gap-2">
            <RouterLink
              :to="`/contracts/${contract.id}/edit`"
              class="btn-primary"
            >
              ✏️ Редактировать
            </RouterLink>
            <button
              @click="submitContract"
              :disabled="isLoading"
              class="btn-primary disabled:opacity-50"
            >
              {{ isLoading ? '⏳' : '✓' }} Отправить на проверку
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-neutral-darker">Договор не найден</p>
        <RouterLink to="/contracts" class="text-primary hover:text-primary-dark font-medium mt-4 inline-block">
          Вернуться к списку договоров
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContractsStore } from '@/stores/contractsStore'
import Header from '@/components/Header.vue'
import type { ContractStatus } from '@/types'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const contractsStore = useContractsStore()

const contractId = computed(() => route.params.id as string)
const contract = computed(() => contractsStore.getContractById(contractId.value))
const isLoading = ref(false)

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
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const downloadFile = () => {
  if (!contract.value?.fileData) return

  const link = document.createElement('a')
  link.href = `data:${contract.value.fileData.type};base64,${contract.value.fileData.content}`
  link.download = contract.value.fileData.name
  link.click()
}

const submitContract = async () => {
  isLoading.value = true
  try {
    await contractsStore.submitContract(contractId.value)
    router.push('/contracts')
  } finally {
    isLoading.value = false
  }
}

const deleteContract = async () => {
  if (confirm('Удалить договор? Это действие нельзя отменить.')) {
    isLoading.value = true
    try {
      await contractsStore.deleteContract(contractId.value)
      router.push('/contracts')
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  contractsStore.fetchContracts()
})
</script>
