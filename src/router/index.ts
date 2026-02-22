import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Вход | Система учета договоров'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Регистрация | Система учета договоров'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Панель управления'
    }
  },
  {
    path: '/contracts',
    name: 'ContractsList',
    component: () => import('@/views/contracts/ContractsListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Мои договоры'
    }
  },
  {
    path: '/contracts/new',
    name: 'CreateContract',
    component: () => import('@/views/contracts/ContractFormView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Создать договор'
    }
  },
  {
    path: '/contracts/:id',
    name: 'ContractDetail',
    component: () => import('@/views/contracts/ContractDetailView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Просмотр договора'
    }
  },
  {
    path: '/contracts/:id/edit',
    name: 'EditContract',
    component: () => import('@/views/contracts/ContractFormView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Редактировать договор'
    }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Админ-панель'
    }
  },
  {
    path: '/admin/catalog',
    name: 'AdminCatalog',
    component: () => import('@/views/admin/CatalogView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Каталог типов договоров'
    }
  },
  {
    path: '/admin/catalog/new',
    name: 'CreateCatalogItem',
    component: () => import('@/views/admin/CatalogFormView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Новый тип договора'
    }
  },
  {
    path: '/admin/catalog/:id/edit',
    name: 'EditCatalogItem',
    component: () => import('@/views/admin/CatalogFormView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Редактировать тип договора'
    }
  },
  {
    path: '/admin/contracts',
    name: 'AdminAllContracts',
    component: () => import('@/views/admin/ContractsReviewView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Все договоры (администратор)'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Профиль'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '404 - Страница не найдена'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Восстанавливаем сессию если это первая загрузка
  if (!authStore.isAuthenticated && from.name === undefined) {
    authStore.restoreSession()
  }

  // Проверяем требуется ли аутентификация
  const requiresAuth = to.meta.requiresAuth !== false
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Если уже авторизован и идет на логин/регистр, перенаправляем
  if (!to.meta.requiresAuth && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  // Проверяем требуется ли роль администратора
  const requiresAdmin = to.meta.requiresAdmin === true
  if (requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
    return
  }

  // Обновляем title страницы
  document.title = (to.meta.title as string) || 'Система учета договоров'

  next()
})

export default router
