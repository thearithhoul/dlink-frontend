<script setup lang="ts">
import axios from 'axios'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createShortLink } from '@/api/short_link'
import type { CreateShortLinkPayload } from '@/api/model/short_links_model'

const router = useRouter()

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const toLocalDateTimeValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const form = reactive({
  default_url: '',
  android_store_url: '',
  ios_store_url: '',
  android_url: '',
  ios_url: '',
  expires_at: toLocalDateTimeValue(new Date(Date.now() + 10 * 60 * 1000)),
})

const toUiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      (typeof error.response?.data?.detail === 'string' && error.response.data.detail.trim()) ||
      (typeof error.response?.data?.message === 'string' && error.response.data.message.trim())

    if (responseMessage) {
      return responseMessage
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Unable to create short link.'
}

const buildPayload = (): CreateShortLinkPayload => {
  const defaultUrl = form.default_url.trim()

  if (!defaultUrl) {
    throw new Error('Default URL is required.')
  }

  const expiresAtDate = new Date(form.expires_at)

  if (Number.isNaN(expiresAtDate.getTime())) {
    throw new Error('Expiry date is invalid.')
  }

  const payload: CreateShortLinkPayload = {
    default_url: defaultUrl,
    expires_at: expiresAtDate.toISOString(),
  }

  const androidStoreUrl = form.android_store_url.trim()
  const iosStoreUrl = form.ios_store_url.trim()
  const androidUrl = form.android_url.trim()
  const iosUrl = form.ios_url.trim()

  if (androidStoreUrl) {
    payload.android_store_url = androidStoreUrl
  }

  if (iosStoreUrl) {
    payload.ios_store_url = iosStoreUrl
  }

  if (androidUrl) {
    payload.android_url = androidUrl
  }

  if (iosUrl) {
    payload.ios_url = iosUrl
  }

  return payload
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = buildPayload()
    const createdLink = await createShortLink(payload)
    successMessage.value = `Created link: ${createdLink.code}`
    await router.push({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = toUiError(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dlink</p>
          <h1 class="mt-1 text-xl font-semibold tracking-tight">Create New Link</h1>
        </div>
        <RouterLink
          to="/dashboard"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Back to Dashboard
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-3xl px-6 py-8">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form class="space-y-5" @submit.prevent="submitForm">
          <div>
            <label for="default_url" class="block text-sm font-medium text-slate-700">
              Default URL (required)
            </label>
            <input
              id="default_url"
              v-model="form.default_url"
              type="url"
              required
              placeholder="https://example.com/"
              class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label for="android_store_url" class="block text-sm font-medium text-slate-700">
              Android Store URL
            </label>
            <input
              id="android_store_url"
              v-model="form.android_store_url"
              type="url"
              placeholder="https://example.com/"
              class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label for="ios_store_url" class="block text-sm font-medium text-slate-700">
              iOS Store URL
            </label>
            <input
              id="ios_store_url"
              v-model="form.ios_store_url"
              type="url"
              placeholder="https://example.com/"
              class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label for="android_url" class="block text-sm font-medium text-slate-700">
              Android URL
            </label>
            <input
              id="android_url"
              v-model="form.android_url"
              type="url"
              placeholder="https://example.com/"
              class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label for="ios_url" class="block text-sm font-medium text-slate-700">iOS URL</label>
            <input
              id="ios_url"
              v-model="form.ios_url"
              type="url"
              placeholder="https://example.com/"
              class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label for="expires_at" class="block text-sm font-medium text-slate-700">
              Expires At (default +10 minutes)
            </label>
            <input
              id="expires_at"
              v-model="form.expires_at"
              type="datetime-local"
              required
              class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
          <p v-if="successMessage" class="text-sm text-emerald-600">{{ successMessage }}</p>

          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Link' }}
            </button>
            <RouterLink
              to="/dashboard"
              class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Cancel
            </RouterLink>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>
