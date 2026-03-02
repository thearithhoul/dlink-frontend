<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getShortLinkById } from '@/api/short_link'
import type { ShortLink } from '@/api/model/short_links_model'

const route = useRoute()

const shortLink = ref<ShortLink | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const getRouteParam = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' && value[0].trim() ? value[0].trim() : null
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null
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

onMounted(async () => {
  const id = getRouteParam(route.params.id)

  if (!id) {
    errorMessage.value = 'Missing short link id from route.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    shortLink.value = await getShortLinkById(id)
  } catch (error) {
    errorMessage.value =
      error instanceof Error && error.message.trim() ? error.message : 'Failed to load short link.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dlink</p>
          <h1 class="mt-1 text-xl font-semibold tracking-tight">Short Link Details</h1>
        </div>
        <RouterLink
          to="/dashboard"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Back to Dashboard
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-4xl px-6 py-8">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p v-if="isLoading" class="text-sm text-slate-600">Loading short link info...</p>
        <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

        <div v-else-if="shortLink" class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Code</p>
            <p class="mt-1 text-lg font-semibold">{{ shortLink.code }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Default URL</p>
              <a :href="shortLink.default_url" class="mt-1 block text-sm text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {{ shortLink.default_url }}
              </a>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p class="mt-1 text-sm" :class="shortLink.is_active ? 'text-emerald-600' : 'text-slate-500'">
                {{ shortLink.is_active ? 'Active' : 'Inactive' }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Expires At</p>
              <p class="mt-1 text-sm">{{ formatDateTime(shortLink.expire_at) }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Created At</p>
              <p class="mt-1 text-sm">{{ formatDateTime(shortLink.create_at) }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Web URL</p>
              <a :href="shortLink.web_url" class="mt-1 block text-sm text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {{ shortLink.web_url }}
              </a>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Android URL</p>
              <a :href="shortLink.android_url" class="mt-1 block text-sm text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {{ shortLink.android_url }}
              </a>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">iOS URL</p>
              <a :href="shortLink.ios_url" class="mt-1 block text-sm text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {{ shortLink.ios_url }}
              </a>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Android Store URL</p>
              <a :href="shortLink.android_store_url" class="mt-1 block text-sm text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {{ shortLink.android_store_url }}
              </a>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">iOS Store URL</p>
              <a :href="shortLink.ios_store_url" class="mt-1 block text-sm text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {{ shortLink.ios_store_url }}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
