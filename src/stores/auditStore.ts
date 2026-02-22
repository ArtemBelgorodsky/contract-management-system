import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuditLog, Notification } from '@/types'

export const useAuditStore = defineStore('audit', () => {
  const auditLogs = ref<AuditLog[]>([
    {
      id: '1',
      adminId: '1',
      adminName: 'Администратор Системы',
      action: 'approve',
      entityType: 'contract',
      entityId: '1',
      details: 'Договор одобрен',
      timestamp: new Date('2026-02-15T10:30:00')
    },
    {
      id: '2',
      adminId: '1',
      adminName: 'Администратор Системы',
      action: 'create',
      entityType: 'contract_type',
      entityId: '5',
      details: 'Создан новый тип договора: "Договор о повышении квалификации"',
      timestamp: new Date('2026-02-05T14:15:00')
    },
    {
      id: '3',
      adminId: '1',
      adminName: 'Администратор Системы',
      action: 'reject',
      entityType: 'contract',
      entityId: '4',
      details: 'Договор отклонен: неполные данные студента',
      timestamp: new Date('2026-02-20T11:45:00')
    }
  ])

  const notifications = ref<Notification[]>([
    {
      id: '1',
      userId: '2',
      message: 'Ваш договор №ДОУ-2024-001 успешно одобрен',
      type: 'success',
      read: false,
      createdAt: new Date('2026-02-15T10:30:00'),
      actionUrl: '/contracts/1'
    },
    {
      id: '2',
      userId: '3',
      message: 'Требуется уточнить данные в договоре №ДОУ-2024-003',
      type: 'warning',
      read: false,
      createdAt: new Date('2026-02-20T11:45:00'),
      actionUrl: '/contracts/4'
    }
  ])

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const getNotificationsByUser = computed(() => {
    return (userId: string) => notifications.value.filter(n => n.userId === userId)
  })

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: String(Date.now()),
      timestamp: new Date()
    }
    auditLogs.value.unshift(newLog)
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: String(Date.now()),
      createdAt: new Date()
    }
    notifications.value.unshift(newNotification)
  }

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = (userId: string) => {
    notifications.value.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true
      }
    })
  }

  const deleteNotification = (notificationId: string) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    auditLogs,
    notifications,
    unreadNotifications,
    getNotificationsByUser,
    addAuditLog,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
})
