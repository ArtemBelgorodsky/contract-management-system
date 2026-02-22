// Пользователь
export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: UserRole
  phone?: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Статусы договора
export type ContractStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

// Каталог типов договоров
export interface ContractType {
  id: string
  name: string
  description: string
  requiredFields: string[]
  template?: string
  createdAt: Date
  updatedAt: Date
}

// Договор
export interface Contract {
  id: string
  userId: string
  typeId: string
  typeName: string
  status: ContractStatus
  contractNumber: string
  studentFullName: string
  studentEmail: string
  studentPhone: string
  courseTitle: string
  courseDuration: string
  coursePrice: string
  startDate: string
  endDate: string
  additionalInfo: string
  fileData?: {
    name: string
    type: string
    size: number
    content: string // base64
  }
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  approvedAt?: Date
  rejectionReason?: string
  adminComment?: string
}

// Фильтры договора
export interface ContractFilters {
  status?: ContractStatus
  search?: string
  typeId?: string
  dateFrom?: string
  dateTo?: string
}

// Логирование действий администратора
export interface AuditLog {
  id: string
  adminId: string
  adminName: string
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject'
  entityType: 'contract_type' | 'contract'
  entityId: string
  changes?: Record<string, unknown>
  timestamp: Date
  details?: string
}

// Статистика
export interface Statistics {
  totalContracts: number
  totalUsers: number
  totalContractTypes: number
  contractsByStatus: {
    draft: number
    submitted: number
    approved: number
    rejected: number
  }
  contractsByType: {
    typeId: string
    typeName: string
    count: number
  }[]
}

// Уведомление
export interface Notification {
  id: string
  userId: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  actionUrl?: string
}
