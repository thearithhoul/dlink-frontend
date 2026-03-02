<script setup lang="ts">
import { useRouter } from 'vue-router'
import { clearAuthTokens } from '@/api/http'
import { onMounted , ref} from 'vue'
import { getCurrentUser } from '@/api/auth'
import { deleteShortLink, getShortLinks } from '@/api/short_link'
import type { ShortLink } from '@/api/model/short_links_model'
import type { TokenUserModel } from '@/api/model/auth_model'


const router = useRouter()

const logout = async () => {
  clearAuthTokens()
  await router.push({ name: 'landing' })
}



const shortLinks = ref<ShortLink[]>([])
const deletingLinkId = ref<string | null>(null)
const user = ref<TokenUserModel | null>(null)
const isShortLinksLoading = ref(false)
const shortLinksError = ref('')
const isUserLoading = ref(false)
const userError = ref('')
const baseDomain = import.meta.env.VITE_PUBLIC_BASE_DOMAIN || 'dlink.local'


const toUiError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim() ? error.message : fallback

const loadShortLinks = async () => {
  isShortLinksLoading.value = true
  shortLinksError.value = ''

  try {
    shortLinks.value = await getShortLinks(100, 1)
  } catch (error) {
    shortLinksError.value = toUiError(error, 'Failed to load links.')
  } finally {
    isShortLinksLoading.value = false
  }
}

const loadCurrentUser = async () => {
  isUserLoading.value = true
  userError.value = ''

  try {
    user.value = await getCurrentUser()
  } catch (error) {
    userError.value = toUiError(error, 'Failed to load your profile.')
  } finally {
    isUserLoading.value = false
  }
}


const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'No expiry'
  }

  const dateValue = new Date(value)

  if (Number.isNaN(dateValue.getTime())) {
    return value
  }

  return dateValue.toLocaleString()
}

const toShortCodeUrl = (code: string) => {
  const domain = user.value?.domain?.trim()

  if (domain) {
    return `https://${domain}.damnaphchab.ink/${code}`
  }

  return code
}

const removeShortLink = async (id: string) => {
  const normalizedId = id.trim()
  if (!normalizedId || deletingLinkId.value != null) {
    return
  }

  const confirmed = window.confirm('Delete this short link? This action cannot be undone.')
  if (!confirmed) {
    return
  }

  deletingLinkId.value = normalizedId
  shortLinksError.value = ''

  try {
    await deleteShortLink({ id: normalizedId })
    shortLinks.value = shortLinks.value.filter((link) => link.id !== normalizedId)
  } catch (error) {
    shortLinksError.value = toUiError(error, 'Failed to delete short link.')
  } finally {
    deletingLinkId.value = null
  }
}

onMounted(() => {
  void loadCurrentUser()
  void loadShortLinks()
})

</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dlink</p>
          <h1 class="mt-1 text-xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink
            to="/"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Landing
          </RouterLink>
          <RouterLink
            to="/links/new"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            New Link
          </RouterLink>
          <!-- <RouterLink
            v-if="!user?.domain"
            to="/subdomain"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Subdomain
          </RouterLink> -->
          <button
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            type="button"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-6 py-8">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Total Clicks</p>
          <p class="mt-2 text-3xl font-semibold tracking-tight">12,480</p>
          <p class="mt-2 text-xs text-emerald-600">+14% from last week</p>
        </article>
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Profile Views</p>
          <p class="mt-2 text-3xl font-semibold tracking-tight">3,210</p>
          <p class="mt-2 text-xs text-emerald-600">+8% from last week</p>
        </article>
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Active Links</p>
          <p class="mt-2 text-3xl font-semibold tracking-tight">9</p>
          <p class="mt-2 text-xs text-slate-500">2 scheduled</p>
        </article>
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Conversion Rate</p>
          <p class="mt-2 text-3xl font-semibold tracking-tight">4.8%</p>
          <p class="mt-2 text-xs text-emerald-600">+0.6% from last week</p>
        </article>
      </section>

      <section class="mt-6">
        <p v-if="isUserLoading" class="text-sm text-slate-600">Loading profile...</p>
        <p v-else-if="userError" class="text-sm text-red-600">{{ userError }}</p>
        <p v-else-if="user?.domain" class="text-sm text-slate-600">
          Your Short Link Domain <span class="font-medium text-slate-900">{{ user.domain }}.{{ baseDomain }}</span>
        </p>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold tracking-tight">All Links Lists</h2>

          <p v-if="isShortLinksLoading" class="mt-5 text-sm text-slate-600">Loading links...</p>
          <p v-else-if="shortLinksError" class="mt-5 text-sm text-red-600">{{ shortLinksError }}</p>
          <p v-else-if="shortLinks.length === 0" class="mt-5 text-sm text-slate-600">
            No short links found.
          </p>

          <ul v-else class="mt-5 space-y-3">
            <li
              v-for="shortLink in shortLinks"
              :key="shortLink.id"
              class="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
            >
              <div class="min-w-0">
                <a
                  :href="toShortCodeUrl(shortLink.code)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="truncate text-xs text-slate-500 hover:text-slate-700"
                >
                  {{ toShortCodeUrl(shortLink.code) }}
                </a>
              </div>
              <div class="text-right">
                <p
                  class="text-xs font-semibold"
                  :class="shortLink.is_active ? 'text-emerald-600' : 'text-slate-500'"
                >
                  {{ shortLink.is_active ? 'Active' : 'Inactive' }}
                </p>
                <p class="text-xs text-slate-500">
                  Expires: {{ formatDateTime(shortLink.expire_at) }}
                </p>
                <RouterLink
                  :to="{ name: 'short-link-info', params: { id: shortLink.id } }"
                  class="mt-1 inline-block text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
                >
                  View
                </RouterLink>
                <button
                  type="button"
                  class="mt-1 ml-3 inline-block text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="deletingLinkId === shortLink.id"
                  @click="removeShortLink(shortLink.id)"
                >
                  {{ deletingLinkId === shortLink.id ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </li>
          </ul>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold tracking-tight">Recent Activity</h2>
          <ul class="mt-5 space-y-4 text-sm">
            <li class="rounded-lg border border-slate-200 px-4 py-3 text-slate-700">
              Updated profile bio and avatar.
            </li>
            <li class="rounded-lg border border-slate-200 px-4 py-3 text-slate-700">
              Added new link: Product Hunt launch.
            </li>
            <li class="rounded-lg border border-slate-200 px-4 py-3 text-slate-700">
              Scheduled weekend campaign post.
            </li>
          </ul>
        </article>
      </section>
    </main>
  </div>
</template>
