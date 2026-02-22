<template>
  <div class="min-h-screen bg-neutral">
    <Header />

    <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Кнопка назад -->
      <button
        @click="$router.back()"
        class="text-primary hover:text-primary-dark font-medium mb-6 flex items-center gap-2"
      >
        ← Вернуться
      </button>

      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditing ? 'Редактировать тип договора' : 'Новый тип договора' }}
        </h1>
      </div>

      <!-- Сообщения -->
      <div v-if="error" class="alert alert-danger mb-6">
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>

      <div v-if="success" class="alert alert-success mb-6">
        <span>✓</span>
        <span>{{ success }}</span>
      </div>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Название -->
        <div class="card">
          <div class="card-body">
            <div class="form-group">
              <label class="input-label">Название типа договора *</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Договор об обучении (очная форма)"
                class="input-field"
                required
              />
            </div>
          </div>
        </div>

        <!-- Описание -->
        <div class="card">
          <div class="card-body">
            <div class="form-group">
              <label class="input-label">Описание *</label>
              <textarea
                v-model="formData.description"
                placeholder="Подробное описание типа договора и его особенностей"
                class="input-field resize-none"
                rows="4"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Обязательные поля -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-bold text-gray-900">Обязательные поля</h2>
          </div>
          <div class="card-body space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value="studentFullName"
                  v-model="formData.requiredFields"
                  class="w-4 h-4 rounded"
                />
                <span class="font-medium text-gray-900">ФИО студента</span>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value="studentEmail"
                  v-model="formData.requiredFields"
                  class="w-4 h-4 rounded"
                />
                <span class="font-medium text-gray-900">Email</span>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value="studentPhone"
                  v-model="formData.requiredFields"
                  class="w-4 h-4 rounded"
                />
                <span class="font-medium text-gray-900">Телефон</span>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value="courseTitle"
                  v-model="formData.requiredFields"
                  class="w-4 h-4 rounded"
                />
                <span class="font-medium text-gray-900">Название курса</span>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value="courseDuration"
                  v-model="formData.requiredFields"
                  class="w-4 h-4 rounded"
                />
                <span class="font-medium text-gray-900">Продолжительность</span>
              </label>

              <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value="coursePrice"
                  v-model="formData.requiredFields"
                  class="w-4 h-4 rounded"
                />
                <span class="font-medium text-gray-900">Стоимость</span>
              </label>
            </div>

            <div v-if="formData.requiredFields.length === 0" class="alert alert-warning text-sm">
              <span>⚠️</span>
              <span>Выберите хотя бы одно обязательное поле</span>
            </div>
          </div>
        </div>

        <!-- Шаблон -->
        <div class="card">
          <div class="card-body">
            <div class="form-group">
              <label class="input-label">Шаблон договора (опционально)</label>
              <textarea
                v-model="formData.template"
                placeholder="Текст шаблона договора..."
                class="input-field resize-none"
                rows="6"
              ></textarea>
              <p class="text-xs text-neutral-darker mt-2">
                Это текст по умолчанию, который будет использоваться при создании договора этого типа
              </p>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex gap-2 justify-between">
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
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalogStore'
import { useAuditStore } from '@/stores/auditStore'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/Header.vue'

const router = useRouter()
const route = useRoute()
const catalogStore = useCatalogStore()
const auditStore = useAuditStore()
const authStore = useAuthStore()

const typeId = computed(() => route.params.id as string)
const isEditing = computed(() => !!typeId.value)

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const formData = reactive({
  name: '',
  description: '',
  requiredFields: [] as string[],
  template: ''
})

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (!formData.name || !formData.description) {
    error.value = 'Заполните все обязательные поля'
    return
  }

  if (formData.requiredFields.length === 0) {
    error.value = 'Выберите хотя бы одно обязательное поле'
    return
  }

  isLoading.value = true

  try {
    if (isEditing.value) {
      await catalogStore.updateContractType(typeId.value, {
        name: formData.name,
        description: formData.description,
        requiredFields: formData.requiredFields,
        template: formData.template
      })

      auditStore.addAuditLog({
        adminId: authStore.currentUser?.id || '',
        adminName: authStore.currentUser?.fullName || 'Unknown',
        action: 'update',
        entityType: 'contract_type',
        entityId: typeId.value,
        details: `Обновлен тип договора: "${formData.name}"`
      })

      success.value = 'Тип договора успешно обновлен'
    } else {
      const newType = await catalogStore.createContractType({
        name: formData.name,
        description: formData.description,
        requiredFields: formData.requiredFields,
        template: formData.template
      })

      auditStore.addAuditLog({
        adminId: authStore.currentUser?.id || '',
        adminName: authStore.currentUser?.fullName || 'Unknown',
        action: 'create',
        entityType: 'contract_type',
        entityId: newType.id,
        details: `Создан новый тип договора: "${formData.name}"`
      })

      success.value = 'Тип договора успешно создан'
    }

    setTimeout(() => {
      router.push('/admin/catalog')
    }, 1500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка сохранения'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await catalogStore.fetchContractTypes()

  if (isEditing.value) {
    const type = catalogStore.getContractTypeById(typeId.value)
    if (type) {
      formData.name = type.name
      formData.description = type.description
      formData.requiredFields = [...type.requiredFields]
      formData.template = type.template || ''
    }
  }
})
</script>
