<script setup lang="ts">
import { oauthCallback } from '@/api/auth'
import { setAccessToken, setRefreshToken } from '@/api/http'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function getQueryString(value:unknown): string | null {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : null
  return typeof value === "string" && value.trim() ? value : null
}

const isLoading = ref(false)
const errorMessage = ref("")



onMounted(async ()=> {
  isLoading.value = true
  errorMessage.value = ""
  const code = getQueryString(route.query.code)

  if (code == null) {
    errorMessage.value = "Missing OAuth code in callback URL."
    isLoading.value = false
    return
  }

  try {
    const token = await oauthCallback({ code })
    if (!token?.access_token) {
      throw new Error("Access token is missing in callback response.")
    }

    setAccessToken(token.access_token)

    if (typeof token.refresh_token === "string" && token.refresh_token.trim()) {
      setRefreshToken(token.refresh_token)
    }

    if (token.user?.domain) {
      await router.replace({ name: "dashboard" })
    } else {
      await router.replace({ name: "set-subdomain" })
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to complete sign-in callback."
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
