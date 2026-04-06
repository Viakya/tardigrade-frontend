import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import LandingView from '../views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView
    },
    {
      path: '/login/:role?',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/operations/dashboard',
      name: 'operations-dashboard',
      component: () => import('../views/OperationsDashboard.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'director', 'manager'] }
    },
    {
      path: '/coach/dashboard',
      name: 'coach-dashboard',
      component: () => import('../views/CoachDashboard.vue'),
      meta: { requiresAuth: true, roles: ['coach'] }
    },
    {
      path: '/student/dashboard',
      name: 'student-dashboard',
      component: () => import('../views/StudentDashboard.vue'),
      meta: { requiresAuth: true, roles: ['student'] }
    },
    {
      path: '/parent/dashboard',
      name: 'parent-dashboard',
      component: () => import('../views/ParentDashboard.vue'),
      meta: { requiresAuth: true, roles: ['parent'] }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      redirect: (to) => {
        const authStore = useAuthStore()
        const role = authStore.userRole
        switch (role) {
          case 'admin':
            return '/operations/dashboard'
          case 'director':
          case 'manager':
            return '/operations/dashboard'
          case 'coach':
            return '/coach/dashboard'
          case 'student':
            return '/student/dashboard'
          case 'parent':
            return '/parent/dashboard'
          default:
            return '/login'
        }
      },
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const allowedRoles = to.meta.roles as string[] | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next('/dashboard')
  } else if (requiresAuth && allowedRoles && authStore.userRole) {
    // Check if user has the required role
    if (allowedRoles.includes(authStore.userRole)) {
      next()
    } else {
      // Redirect to appropriate dashboard if role doesn't match
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router
