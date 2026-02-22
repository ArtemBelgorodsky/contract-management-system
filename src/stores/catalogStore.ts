import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContractType } from '@/types'

// Мок данные типов договоров
const mockContractTypes: ContractType[] = [
  {
    id: '1',
    name: 'Договор об обучении (очная форма)',
    description: 'Стандартный договор об обучении на очной форме обучения',
    requiredFields: ['studentFullName', 'studentEmail', 'studentPhone', 'courseTitle', 'courseDuration', 'coursePrice'],
    template: 'Договор заключен между Университетом и обучающимся на следующих условиях...',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  },
  {
    id: '2',
    name: 'Договор об обучении (заочная форма)',
    description: 'Договор об обучении на заочной форме обучения',
    requiredFields: ['studentFullName', 'studentEmail', 'studentPhone', 'courseTitle', 'courseDuration', 'coursePrice'],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  },
  {
    id: '3',
    name: 'Договор об обучении (онлайн)',
    description: 'Договор об обучении на основе электронного обучения и дистанционных технологий',
    requiredFields: ['studentFullName', 'studentEmail', 'courseTitle', 'courseDuration', 'coursePrice'],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15')
  },
  {
    id: '4',
    name: 'Договор о профессиональной переподготовке',
    description: 'Договор для программ профессиональной переподготовки',
    requiredFields: ['studentFullName', 'studentEmail', 'studentPhone', 'courseTitle', 'courseDuration', 'coursePrice'],
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01')
  },
  {
    id: '5',
    name: 'Договор о повышении квалификации',
    description: 'Договор для программ повышения квалификации',
    requiredFields: ['studentFullName', 'studentEmail', 'courseTitle', 'courseDuration', 'coursePrice'],
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-05')
  }
]

export const useCatalogStore = defineStore('catalog', () => {
  const contractTypes = ref<ContractType[]>(JSON.parse(JSON.stringify(mockContractTypes)))
  const isLoading = ref(false)

  const getContractTypeById = computed(() => {
    return (id: string) => contractTypes.value.find(type => type.id === id)
  })

  const fetchContractTypes = async () => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return contractTypes.value
    } finally {
      isLoading.value = false
    }
  }

  const createContractType = async (data: Omit<ContractType, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 600))

      const newType: ContractType = {
        ...data,
        id: String(Date.now()),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      contractTypes.value.push(newType)
      return newType
    } finally {
      isLoading.value = false
    }
  }

  const updateContractType = async (id: string, data: Partial<Omit<ContractType, 'id' | 'createdAt'>>) => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 600))

      const index = contractTypes.value.findIndex(t => t.id === id)
      if (index === -1) throw new Error('Тип договора не найден')

      const existingType = contractTypes.value[index]
      if (!existingType) throw new Error('Тип договора не найден')

      contractTypes.value[index] = {
        ...existingType,
        ...data,
        id: existingType.id,
        name: data.name ?? existingType.name,
        description: data.description ?? existingType.description,
        requiredFields: data.requiredFields ?? existingType.requiredFields,
        createdAt: existingType.createdAt,
        updatedAt: new Date()
      }

      return contractTypes.value[index]
    } finally {
      isLoading.value = false
    }
  }

  const deleteContractType = async (id: string) => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = contractTypes.value.findIndex(t => t.id === id)
      if (index === -1) throw new Error('Тип договора не найден')

      contractTypes.value.splice(index, 1)
    } finally {
      isLoading.value = false
    }
  }

  return {
    contractTypes,
    isLoading,
    getContractTypeById,
    fetchContractTypes,
    createContractType,
    updateContractType,
    deleteContractType
  }
})
