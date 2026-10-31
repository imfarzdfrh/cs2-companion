<script setup lang="ts">
import { ArrowUpRight, ShieldCheck, SunMoon } from 'lucide-vue-next'
const store = useCompanion()
const config = useRuntimeConfig()
const steamAuthUrl = computed(() => new URL('/v1/auth/steam', String(config.public.apiBase)).toString())
function toggleWelcomeTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark'
  store.setTheme(isDark ? 'light' : 'dark')
}
const needsLanConfig = computed(() => {
  if (typeof window === 'undefined') return false
  try {
    const apiHost = new URL(String(config.public.apiBase)).hostname
    const localApi = apiHost === 'localhost' || apiHost === '127.0.0.1'
    const localPage = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    return localApi && !localPage
  } catch {
    return true
  }
})
</script>
<template>
  <section class="welcome">
    <button
      class="icon-button welcome-theme"
      aria-label="Toggle theme"
      @click="toggleWelcomeTheme"
    >
      <SunMoon />
    </button>
    <div class="welcome-logo">
      <strong>CS<span>2</span></strong>
      <p>C O M P A N I O N</p>
    </div>
    <img
      src="/art/operative.svg"
      alt="Original geometric tactical operative illustration"
      class="operative"
    />
    <div class="welcome-bottom">
      <span class="eyebrow">EVERY ROUND IS A NEW CHANCE</span>
      <h1>Your stats.<br />Your progress.<br /><em>Your game.</em></h1>
      <p v-if="needsLanConfig" class="offline-notice" role="status">
        The API is configured as localhost. On a phone, localhost points to the phone itself.
        Set NUXT_PUBLIC_API_BASE to your computer's local network IP.
      </p>
      <p v-else-if="store.connectionIssue" class="offline-notice" role="status">
        The API server could not be reached. Check the backend address and make sure the server is
        running and reachable from this device.
      </p>
      <a class="button primary" :href="steamAuthUrl"
        ><ShieldCheck :size="20" /> Continue with Steam <ArrowUpRight :size="18"
      /></a>
      <button class="button text-button" @click="store.startDemo">Explore demo →</button>
      <p class="fine-print">
        We never ask for your Steam password.<br />Independent companion. Not affiliated with Valve
        or FACEIT.
      </p>
    </div>
  </section>
</template>
