<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
const config = useRuntimeConfig()
const menu = ref(false)
const hydrated = ref(false)
const route = useRoute()
onMounted(() => { hydrated.value = true })
watch(() => route.path, () => { menu.value = false })
</script>
<template>
  <div>
    <header class="site-header" @keydown.esc="menu = false">
      <a class="skip-link" href="#site-main">Skip to content</a>
      <NuxtLink to="/" class="logo"
        ><b>//</b><span>CS2<small>COMPANION</small></span></NuxtLink
      ><button
        class="menu-toggle"
        :aria-label="menu ? 'Close navigation' : 'Open navigation'"
        :aria-expanded="menu"
        aria-controls="site-navigation"
        :disabled="!hydrated"
        @click="menu = !menu"
      >
        <X v-if="menu" :size="20" /><Menu v-else :size="20" />
      </button>
      <nav id="site-navigation" aria-label="Site navigation" :class="{ open: menu }" @click="menu = false">
        <NuxtLink to="/">Home</NuxtLink><a href="/#features">Features</a><a href="/#stats">Stats</a
        ><a href="/#inventory">Inventory</a><NuxtLink to="/download">Download</NuxtLink
        ><a href="/#faq">FAQ</a>
      </nav>
      <a class="signin" :href="config.public.mobileUrl + '/welcome'">Sign in <span>↗</span></a>
    </header>
    <main id="site-main"><NuxtPage /></main>
    <footer>
      <NuxtLink to="/" class="logo"
        ><b>//</b><span>CS2<small>COMPANION</small></span></NuxtLink
      >
      <p>Your stats. Your progress. Your game.</p>
      <div>
        <NuxtLink to="/privacy">Privacy</NuxtLink><NuxtLink to="/terms">Terms</NuxtLink
        ><NuxtLink to="/support">Support</NuxtLink
        ><a
          href="https://github.com/imfarzdfrh/cs2-companion"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub ↗</a
        >
      </div>
      <small
        >Independent project. Not affiliated with Valve or FACEIT. Counter-Strike and Steam belong
        to Valve.</small
      >
    </footer>
  </div>
</template>
