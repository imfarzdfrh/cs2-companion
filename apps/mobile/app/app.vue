<script setup lang="ts">
import { House, ChartNoAxesCombined, Crosshair, Box, UserRound, Bell, ArrowLeft } from 'lucide-vue-next'

const store = useCompanion()
const route = useRoute()
const shellReady = ref(false)

const tabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/stats', label: 'Stats', icon: ChartNoAxesCombined },
  { to: '/matches', label: 'Matches', icon: Crosshair },
  { to: '/inventory', label: 'Inventory', icon: Box },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

const isWelcome = computed(() => route.path === '/welcome')
const isMatchDetail = computed(() => /^\/matches\/[^/]+$/.test(route.path))

onMounted(async () => {
  try {
    await store.init(isWelcome.value)
    if (!store.profile && !store.demo && !isWelcome.value) {
      await navigateTo('/welcome', { replace: true })
    }
  } finally {
    shellReady.value = true
  }
})

watch(
  () => route.path,
  async (path) => {
    if (!shellReady.value || path === '/welcome') return
    if (!store.profile && !store.demo) {
      await navigateTo('/welcome', { replace: true })
    }
  }
)
</script>

<template>
  <div class="app-frame">
    <div class="phone-content">
      <template v-if="shellReady && store.ready">
        <header v-if="!isWelcome" class="app-header">
          <NuxtLink
            v-if="isMatchDetail"
            to="/matches"
            class="header-back"
            aria-label="Back to matches"
          >
            <ArrowLeft :size="21" />
          </NuxtLink>
          <NuxtLink v-else to="/" class="wordmark" aria-label="CS2 Companion home">
            CS2<span>COMPANION</span>
          </NuxtLink>
          <NuxtLink to="/notifications" class="icon-button" aria-label="Notifications">
            <Bell :size="21" />
          </NuxtLink>
        </header>

        <div v-if="store.demo && !isWelcome" class="demo-strip">
          <span class="status-dot" />
          <span>DEMO MODE · SAMPLE DATA</span>
          <NuxtLink to="/welcome">Connect account ↗</NuxtLink>
        </div>

        <div v-else-if="store.connectionIssue && !isWelcome" class="connection-strip" role="status">
          <span class="status-dot muted" />
          <span>Server unavailable · showing connection options</span>
          <NuxtLink to="/welcome">Details</NuxtLink>
        </div>

        <main id="main-content">
          <NuxtPage />
        </main>

        <nav v-if="!isWelcome" class="bottom-nav" aria-label="Main navigation">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            :class="{
              selected: route.path === tab.to || (tab.to !== '/' && route.path.startsWith(tab.to)),
            }"
            :aria-current="
              route.path === tab.to || (tab.to !== '/' && route.path.startsWith(tab.to))
                ? 'page'
                : undefined
            "
          >
            <component :is="tab.icon" :size="21" />
            <span>{{ tab.label }}</span>
          </NuxtLink>
        </nav>
      </template>

      <div v-else class="boot" role="status" aria-live="polite">
        <span class="brand-mark">//</span>
        <span class="boot-spinner" aria-hidden="true" />
        <p>Preparing your companion…</p>
      </div>
    </div>

    <div v-if="store.toast" class="toast" role="status">{{ store.toast }}</div>
  </div>
</template>
