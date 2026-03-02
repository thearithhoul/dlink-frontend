<script setup lang="ts">
import axios from 'axios'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { setCurrentUserSubdomain } from '@/api/auth'

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')
const baseDomain = import.meta.env.VITE_PUBLIC_BASE_DOMAIN || 'dlink.local'

const form = reactive({
  subdomain: '',
})

const normalizeSubdomain = (value: string) => value.trim().toLowerCase()

const validateSubdomain = (value: string): string | null => {
  if (!value) {
    return 'Subdomain is required.'
  }

  if (value.length < 3 || value.length > 32) {
    return 'Subdomain must be between 3 and 32 characters.'
  }

  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value)) {
    return 'Use lowercase letters, numbers, and hyphen only. No leading/trailing hyphen.'
  }

  return null
}

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

  return 'Unable to save subdomain.'
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const normalizedSubdomain = normalizeSubdomain(form.subdomain)
    const validationError = validateSubdomain(normalizedSubdomain)

    if (validationError) {
      throw new Error(validationError)
    }

    await setCurrentUserSubdomain(normalizedSubdomain)
    await router.replace({ name: 'dashboard' })
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
          <h1 class="mt-1 text-xl font-semibold tracking-tight">Set Custom Subdomain</h1>
        </div>
        <RouterLink
          to="/dashboard"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Skip for now
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-3xl px-6 py-8">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-sm text-slate-600">
          Pick your public subdomain. You can change it later from your account settings.
        </p>

        <form class="mt-6 space-y-5" @submit.prevent="submitForm">
          <div>
            <label for="subdomain" class="block text-sm font-medium text-slate-700">Subdomain</label>
            <div class="mt-2 flex items-center rounded-md border border-slate-300 bg-white">
              <span class="px-3 text-sm text-slate-500">https://</span>
              <input
                id="subdomain"
                v-model="form.subdomain"
                type="text"
                required
                placeholder="your-name"
                class="w-full border-0 px-0 py-2 text-sm text-slate-900 outline-none"
              />
              <span class="px-3 text-sm text-slate-500">.{{ baseDomain }}</span>
            </div>
            <p class="mt-2 text-xs text-slate-500">
              3-32 chars, lowercase letters, numbers, and hyphen.
            </p>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Subdomain' }}
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
