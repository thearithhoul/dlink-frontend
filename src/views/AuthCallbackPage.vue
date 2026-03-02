<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import { exchangeGoogleCallbackCode, getCurrentUser } from '@/api/auth'
import { setAccessToken, setRefreshToken } from '@/api/http'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const errorMessage = ref('')

const normalizeValue = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim()

        if (trimmed) {
          return trimmed
        }
      }
    }

    return null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed || null
}

const readHashParam = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const hashValue = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash

  if (!hashValue) {
    return null
  }

  const hashParams = new URLSearchParams(hashValue)
  return normalizeValue(hashParams.get(key))
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

  return 'Unable to complete sign-in callback.'
}

onMounted(async () => {
  const backendError =
    normalizeValue(route.query.error_description) ??
    normalizeValue(route.query.error) ??
    readHashParam('error_description') ??
    readHashParam('error')

  if (backendError) {
    errorMessage.value = `Sign-in failed: ${backendError}`
    isLoading.value = false
    return
  }

  const code = normalizeValue(route.query.code) ?? readHashParam('code')
  const state = normalizeValue(route.query.state) ?? readHashParam('state')

  if (!code) {
    errorMessage.value = 'Missing OAuth code in callback URL.'
    isLoading.value = false
    return
  }

  try {
    const tokenPayload = await exchangeGoogleCallbackCode({ code, state })
    setAccessToken(tokenPayload.access_token)
    if (typeof tokenPayload.refresh_token === 'string' && tokenPayload.refresh_token.trim()) {
      setRefreshToken(tokenPayload.refresh_token)
    }
    const user = await getCurrentUser()

    if (user.domain == null) {
      await router.replace({ name: 'set-subdomain' })
    } else {
      await router.replace({ name: 'dashboard' })
    }

  } catch (error) {
    errorMessage.value = toUiError(error)
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <main class="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section class="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 class="text-2xl font-semibold tracking-tight">Authenticating</h1>

        <p v-if="isLoading" class="mt-3 text-sm text-slate-600">Processing callback...</p>

        <p v-if="errorMessage" class="mt-3 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <RouterLink
          to="/signin"
          class="mt-6 inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Back to sign in
        </RouterLink>
      </section>
    </main>
  </div>
</template>
