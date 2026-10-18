<script setup lang="ts">
const config = useRuntimeConfig()
const menu = ref(false)
</script>
<template>
  <div>
    <header class="site-header">
      <NuxtLink to="/" class="logo"
        ><b>//</b><span>CS2<small>COMPANION</small></span></NuxtLink
      ><button
        class="menu-toggle"
        aria-label="Toggle navigation"
        :aria-expanded="menu"
        @click="menu = !menu"
      >
        ☰
      </button>
      <nav :class="{ open: menu }" @click="menu = false">
        <NuxtLink to="/">Home</NuxtLink><a href="/#features">Features</a><a href="/#stats">Stats</a
        ><a href="/#inventory">Inventory</a><NuxtLink to="/download">Download</NuxtLink
        ><a href="/#faq">FAQ</a>
      </nav>
      <a class="signin" :href="config.public.mobileUrl + '/welcome'">Sign in <span>↗</span></a>
    </header>
    <main><NuxtPage /></main>
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
