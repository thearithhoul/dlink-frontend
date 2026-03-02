<script setup lang="ts">
import { ref } from 'vue'
import { clearAuthTokens } from '@/api/http'
import { oauthAuthorize } from '@/api/auth'

const isLoading = ref(false)
const errorMessage = ref('')

const signInWithGoogle = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    clearAuthTokens()
    const data = await oauthAuthorize()
    const authorizationUrl = data?.authorization_url?.trim()

    if (!authorizationUrl) {
      throw new Error('Authorization URL is missing from backend response.')
    }

    try {
      new URL(authorizationUrl)
    } catch {
      throw new Error('Authorization URL is invalid.')
    }

    window.location.assign(authorizationUrl)
  } catch (error) {
    errorMessage.value =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'Unable to start Google sign-in. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <main class="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section class="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 class="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p class="mt-2 text-sm text-slate-600">Continue with Google to access your account.</p>

        <button
          type="button"
          :disabled="isLoading"
          @click="signInWithGoogle"
          class="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h5.814c-.257 1.322-1.54 3.877-5.814 3.877-3.498 0-6.346-2.896-6.346-6.477s2.848-6.477 6.346-6.477c1.99 0 3.32.85 4.08 1.582l2.787-2.687C17.34 2.569 14.985 1.5 12.24 1.5 6.99 1.5 2.73 5.76 2.73 11.01s4.26 9.51 9.51 9.51c5.49 0 9.126-3.858 9.126-9.294 0-.624-.07-1.102-.155-1.582H12.24z"
            />
            <path
              fill="#FBBC05"
              d="M4.467 7.098 7.706 9.47a6.444 6.444 0 0 1 4.534-3.147V2.208a9.47 9.47 0 0 0-7.773 4.89z"
            />
            <path
              fill="#34A853"
              d="M12.24 20.52c2.64 0 4.853-.87 6.47-2.352l-2.99-2.43c-.8.56-1.828.95-3.48.95-2.72 0-5.026-1.84-5.85-4.31l-3.34 2.58a9.49 9.49 0 0 0 9.19 5.56z"
            />
            <path
              fill="#4285F4"
              d="M21.366 11.226c0-.636-.058-1.246-.155-1.826H12.24v4.115h5.814c-.25 1.345-1.052 2.485-2.233 3.253l2.99 2.43c1.74-1.606 2.755-3.976 2.755-6.972z"
            />
          </svg>
          {{ isLoading ? 'Connecting...' : 'Continue with Google' }}
        </button>

        <p v-if="errorMessage" class="mt-3 text-center text-xs text-red-600">
          {{ errorMessage }}
        </p>

        <p class="mt-4 text-center text-xs text-slate-500">Google OAuth is the only sign-in method.</p>
      </section>
    </main>
  </div>
</template>
