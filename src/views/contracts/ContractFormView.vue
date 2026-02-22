<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditing ? 'Редактировать договор' : 'Создать новый договор' }}
        </h1>
        <p class="text-neutral-darker mt-2">
          {{ isEditing ? 'Обновите информацию договора' : 'Заполните все необходимые реквизиты' }}
        </p>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="alert alert-danger mb-6">
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- Сообщение об успехе -->
      <div v-if="success" class="alert alert-success mb-6">
        <span>✓</span>
        <span>{{ success }}</span>
      </div>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Выбор типа договора -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">1️⃣ Тип договора</h2>
          </div>
          <div class="card-body">
            <label class="input-label">Выберите тип договора</label>
            <select
              v-model="formData.typeId"
              class="input-field"
              required
            >
              <option value="">— Выберите тип договора —</option>
              <option
                v-for="type in catalogStore.contractTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>
            <p v-if="selectedType" class="text-sm text-neutral-darker mt-2">
              {{ selectedType.description }}
            </p>
          </div>
        </div>

        <!-- Информация о студенте -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">2️⃣ Информация о студенте</h2>
          </div>
          <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="input-label">Полное имя студента *</label>
                <input
                  v-model="formData.studentFullName"
                  type="text"
                  placeholder="Иван Петрович Сидоров"
                  class="input-field"
                  required
                />
              </div>

              <div class="form-group">
                <label class="input-label">Email *</label>
                <input
                  v-model="formData.studentEmail"
                  type="email"
                  placeholder="student@mail.ru"
                  class="input-field"
                  required
                />
              </div>

              <div class="form-group">
                <label class="input-label">Телефон</label>
                <input
                  v-model="formData.studentPhone"
                  type="tel"
                  placeholder="+7 (900) 123-45-67"
                  class="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о курсе -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">3️⃣ Информация о курсе</h2>
          </div>
          <div class="card-body space-y-4">
            <div class="form-group">
              <label class="input-label">Название курса *</label>
              <input
                v-model="formData.courseTitle"
                type="text"
                placeholder="Веб-разработка на Vue.js"
                class="input-field"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-group">
                <label class="input-label">Продолжительность *</label>
                <input
                  v-model="formData.courseDuration"
                  type="text"
                  placeholder="3 месяца"
                  class="input-field"
                  required
                />
              </div>

              <div class="form-group">
                <label class="input-label">Стоимость (₽) *</label>
                <input
                  v-model="formData.coursePrice"
                  type="text"
                  placeholder="25000"
                  class="input-field"
                  required
                />
              </div>

              <div class="form-group">
                <label class="input-label">Начало курса *</label>
                <input
                  v-model="formData.startDate"
                  type="date"
                  class="input-field"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="input-label">Конец курса *</label>
              <input
                v-model="formData.endDate"
                type="date"
                class="input-field"
                required
              />
            </div>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">4️⃣ Дополнительно</h2>
          </div>
          <div class="card-body space-y-4">
            <div class="form-group">
              <label class="input-label">Дополнительная информация</label>
              <textarea
                v-model="formData.additionalInfo"
                placeholder="Например: скидка 10%, условия отмены и т.д."
                class="input-field resize-none"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Загрузка файла -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">5️⃣ Отсканированный договор</h2>
          </div>
          <div class="card-body">
            <label class="input-label">Загрузите отсканированный договор (PDF, JPG, PNG, DOC, DOCX)</label>
            <div
              @drop.prevent="handleFileDrop"
              @dragover.prevent
              class="border-2 border-dashed border-neutral-dark rounded-lg p-8 text-center hover:border-primary hover:bg-primary-light transition-colors cursor-pointer"
            >
              <input
                ref="fileInput"
                type="file"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                class="hidden"
              />

              <div @click="fileInput?.click()">
                <div class="text-4xl mb-2">📄</div>
                <p class="font-medium text-gray-900 mb-1">Перетащите файл или нажмите для загрузки</p>
                <p class="text-sm text-neutral-darker">PDF, JPG, PNG, DOC или DOCX (макс. 10 MB)</p>
              </div>

              <div v-if="fileData" class="mt-4 p-4 bg-green-100 rounded-lg">
                <p class="text-sm font-medium text-green-700">✓ Файл загружен: {{ fileData.name }}</p>
                <p class="text-xs text-green-600 mt-1">{{ formatFileSize(fileData.size) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки действия -->
        <div class="card-footer flex gap-4 justify-between">
          <button
            v-if="isEditing && formData.status === 'draft'"
            type="button"
            @click="deleteContract"
            :disabled="isLoading"
            class="btn-danger disabled:opacity-50"
          >
            🗑️ Удалить
          </button>

          <div class="flex gap-2">
            <button
              type="button"
              @click="$router.back()"
              class="btn-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary disabled:opacity-50"
            >
              {{ isLoading ? '⏳ Сохранение...' : (isEditing ? '💾 Обновить' : '➕ Создать') }}
            </button>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useContractsStore } from '@/stores/contractsStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { ContractStatus } from '@/types'
import Header from '@/components/Header.vue'


const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const contractsStore = useContractsStore()
const catalogStore = useCatalogStore()

const fileInput = ref<HTMLInputElement>()
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const fileData = ref<{ name: string; type: string; size: number; content: string } | null>(null)

const contractId = computed(() => route.params.id as string)
const isEditing = computed(() => !!contractId.value)

const contract = computed(() => {
  if (!isEditing.value) return null
  return contractsStore.getContractById(contractId.value)
})

const formData = ref({
  typeId: '',
  studentFullName: '',
  studentEmail: '',
  studentPhone: '',
  courseTitle: '',
  courseDuration: '',
  coursePrice: '',
  startDate: '',
  endDate: '',
  additionalInfo: '',
  status: 'draft' as ContractStatus
})

const selectedType = computed(() => {
  return catalogStore.getContractTypeById(formData.value.typeId)
})



const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Файл слишком большой. Максимум 10 MB'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const base64Content = content.split(',')[1] || ''
    fileData.value = {
      name: file.name,
      type: file.type,
      size: file.size,
      content: base64Content
    }
  }
  reader.readAsDataURL(file)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  console.log(formData.value)

  if (!formData.value.typeId) {
    error.value = 'Выберите тип договора'
    console.log('error')
    return
  }

  if (!fileData.value) {
    error.value = 'Загрузите отсканированный договор'
    return
  }

  isLoading.value = true

  try {
    const contractData = {
      userId: authStore.currentUser?.id || '',
      typeId: formData.value.typeId,
      typeName: selectedType.value?.name || '',
      contractNumber: isEditing.value ? contract.value?.contractNumber || '' : `ДОУ-${new Date().getFullYear()}-${String(contractsStore.contracts.length + 1).padStart(3, '0')}`,
      studentFullName: formData.value.studentFullName,
      studentEmail: formData.value.studentEmail,
      studentPhone: formData.value.studentPhone,
      courseTitle: formData.value.courseTitle,
      courseDuration: formData.value.courseDuration,
      coursePrice: formData.value.coursePrice,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      additionalInfo: formData.value.additionalInfo,
      fileData: fileData.value,
      status: formData.value.status
    }

    console.log(contractData.fileData)

    if (isEditing.value) {
      await contractsStore.updateContract(contractId.value, contractData)
      success.value = 'Договор успешно обновлен'
    } else {
      await contractsStore.createContract(authStore.currentUser?.id || '', contractData)
      success.value = 'Договор успешно создан'
    }

    setTimeout(() => {
      router.push('/contracts')
    }, 1500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка сохранения договора'
  } finally {
    isLoading.value = false
  }
  
}

const deleteContract = async () => {
  if (confirm('Вы уверены? Это действие нельзя отменить.')) {
    isLoading.value = true
    try {
      await contractsStore.deleteContract(contractId.value)
      router.push('/contracts')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка удаления договора'
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(async () => {
  await catalogStore.fetchContractTypes()

  if (isEditing.value && contract.value) {
    formData.value = {
      typeId: contract.value.typeId,
      studentFullName: contract.value.studentFullName,
      studentEmail: contract.value.studentEmail,
      studentPhone: contract.value.studentPhone,
      courseTitle: contract.value.courseTitle,
      courseDuration: contract.value.courseDuration,
      coursePrice: contract.value.coursePrice,
      startDate: contract.value.startDate,
      endDate: contract.value.endDate,
      additionalInfo: contract.value.additionalInfo,
      status: contract.value.status
    }

    if (contract.value.fileData) {
      fileData.value = contract.value.fileData
    }
  }
})
</script>
