import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/views/DashboardPage.vue'
import LandingPage from '@/views/LandingPage.vue'
import SignInPage from '@/views/SignInPage.vue'
import AuthCallbackPage from '@/views/AuthCallbackPage.vue'
import NewLinkPage from '@/views/NewLinkPage.vue'
import SetSubdomainPage from '@/views/SetSubdomainPage.vue'
import ShortLinkInfoPage from '@/views/ShortLinkInfoPage.vue'
import ShortLinkLoadingPage from '@/views/ShortLinkLoadingPage.vue'
import { hasAccessToken } from '@/api/http'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInPage,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallbackPage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
    },
    {
      path: '/links/new',
      name: 'new-link',
      component: NewLinkPage,
    },
    {
      path: '/links/:id',
      name: 'short-link-info',
      component: ShortLinkInfoPage,
    },
    {
      path: '/subdomain',
      name: 'set-subdomain',
      component: SetSubdomainPage,
    },
    {
      path: '/:code',
      name: 'short-link-loading',
      component: ShortLinkLoadingPage,
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'signin' && hasAccessToken()) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
