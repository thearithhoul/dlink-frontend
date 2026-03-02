<script setup lang="ts">
import { hasAccessToken } from '@/api/http'

const isSignedIn = hasAccessToken()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <a class="text-xl font-semibold tracking-tight" href="/">តំណភ្ចាប់</a>
      <div class="flex items-center gap-3">
        <!-- <RouterLink
          to="/dashboard"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Dashboard
        </RouterLink> -->
        <RouterLink
          v-if="!isSignedIn"
          to="/signin"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Sign In
        </RouterLink>
        <RouterLink
          v-else
          to="/dashboard"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Dashboard
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
      <section>
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Landing Page</p>
        <h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          One place for all your most important links.
        </h1>
        <p class="mt-6 max-w-xl text-lg text-slate-600">
          Create a clean profile, share content fast, and send people exactly where they need to go.
        </p>
        <div class="mt-10 flex flex-wrap gap-4">
          <RouterLink
            :to="isSignedIn ? '/dashboard' : '/signin'"
            class="rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {{ isSignedIn ? 'Open Dashboard' : 'Get Started' }}
          </RouterLink>
          <!-- <RouterLink
            v-if="!isSignedIn"
            to="/dashboard"
            class="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            View Dashboard
          </RouterLink> -->
        </div>
      </section>

      <section id="features" class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 class="text-lg font-semibold">Why Damna-Phchab</h2>
        <ul class="mt-6 space-y-4 text-sm text-slate-600">
          <li class="rounded-md bg-slate-50 px-4 py-3">Fast setup with a single profile link.</li>
          <li class="rounded-md bg-slate-50 px-4 py-3">Easy sharing for social platforms and messages.</li>
          <li class="rounded-md bg-slate-50 px-4 py-3">Simple analytics-ready structure for future growth.</li>
        </ul>
      </section>
    </main>
  </div>
</template>
