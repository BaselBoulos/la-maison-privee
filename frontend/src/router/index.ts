import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import Login from '../views/Login.vue'
import Overview from '../views/Overview.vue'
import Members from '../views/Members.vue'
import MemberDetail from '../views/MemberDetail.vue'
import Events from '../views/Events.vue'
import EventDetail from '../views/EventDetail.vue'
import InvitationCodes from '../views/InvitationCodes.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Overview
        },
        {
          path: 'members',
          name: 'members',
          component: Members
        },
        {
          path: 'members/:id',
          name: 'member-detail',
          component: MemberDetail
        },
        {
          path: 'events',
          name: 'events',
          component: Events
        },
        {
          path: 'events/:id',
          name: 'event-detail',
          component: EventDetail
        },
        {
          path: 'invitation-codes',
          name: 'invitation-codes',
          component: InvitationCodes
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings
        }
      ]
    }
  ]
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
