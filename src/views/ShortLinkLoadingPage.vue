<script setup lang="ts">
import { redirectLink } from '@/api/short_link'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const errorMessage = ref('')

const toNonEmptyString = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' && first.trim() ? first.trim() : null
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const callApi = async (subdomain: string, code: string): Promise<string | null> => {
  try {
    const data = await redirectLink(code, subdomain)
  

    return data.redirect_link
  } catch {
    return null
  }
}


onMounted(async () => {
  const code = toNonEmptyString(route.params.code)

  if (!code) {
    errorMessage.value = 'Short link code is missing.'
    return
  }

  const subdomain = window.location.hostname.split('.')[0]?.trim() ?? ''

  if (!subdomain) {
    errorMessage.value = 'Subdomain is missing.'
    return
  }

  const targetUrl = await callApi(subdomain, code)

  if (!targetUrl) {
    errorMessage.value = 'Unable to resolve short link destination.'
    return
  }

  window.location.replace(targetUrl)
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <main class="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section class="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 class="text-2xl font-semibold tracking-tight">Opening Link</h1>
        <p v-if="!errorMessage" class="mt-3 text-sm text-slate-600">Please wait...</p>
        <p v-else class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
        <RouterLink
          to="/"
          class="mt-6 inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Back to Home
        </RouterLink>
      </section>
    </main>
  </div>
</template>
