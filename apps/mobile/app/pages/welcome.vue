<script setup lang="ts">
import { ArrowUpRight, ShieldCheck, SunMoon } from 'lucide-vue-next'
const store = useCompanion(),
  config = useRuntimeConfig()
const isNative = ref(false)
onMounted(async () => {
  const { Capacitor } = await import('@capacitor/core')
  isNative.value = Capacitor.isNativePlatform()
})
</script>
<template>
  <section class="welcome">
    <button
      class="icon-button welcome-theme"
      aria-label="Switch theme"
      @click="store.setTheme(store.theme === 'dark' ? 'light' : 'dark')"
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
      <a v-if="!isNative" class="button primary" :href="config.public.apiBase + '/v1/auth/steam'"
        ><ShieldCheck :size="20" /> Continue with Steam <ArrowUpRight :size="18"
      /></a>
      <p v-else class="note">
        Native Steam sign-in is not yet enabled. Explore demo mode or sign in using the web app.
      </p>
      <button class="button text-button" @click="store.startDemo">Explore demo →</button>
      <p class="fine-print">
        We never ask for your Steam password.<br />Independent companion. Not affiliated with Valve
        or FACEIT.
      </p>
    </div>
  </section>
</template>
