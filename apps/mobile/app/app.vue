<script setup lang="ts">
import {
  House,
  ChartNoAxesCombined,
  Crosshair,
  Box,
  UserRound,
  Bell,
  ArrowLeft,
  Flame,
} from 'lucide-vue-next'
const store = useCompanion(),
  route = useRoute()
const tabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/stats', label: 'Stats', icon: ChartNoAxesCombined },
  { to: '/matches', label: 'Matches', icon: Crosshair },
  { to: '/inventory', label: 'Inventory', icon: Box },
  { to: '/profile', label: 'Profile', icon: UserRound },
]
onMounted(async () => {
  await store.init()
  if (!store.profile && !store.demo && route.path != '/welcome') await navigateTo('/welcome')
})
</script>
<template>
  <div class="app-frame">
    <aside class="desktop-brand">
      <span class="brand-mark">//</span>
      <h1>CS2<br /><em>COMPANION</em></h1>
      <p>Your stats.<br />Your progress.<br />Your game.</p>
      <div class="desktop-caption"><Flame :size="18" /> BUILT FOR YOUR NEXT LEVEL</div>
    </aside>
    <div class="phone-content">
      <template v-if="store.ready">
        <header v-if="route.path != '/welcome'" class="app-header">
          <NuxtLink
            v-if="route.path.split('/').filter(Boolean).length > 1"
            to="/matches"
            aria-label="Back to matches"
            ><ArrowLeft /></NuxtLink
          ><NuxtLink v-else to="/" class="wordmark">CS2<span>COMPANION</span></NuxtLink
          ><NuxtLink to="/notifications" class="icon-button" aria-label="Notifications"
            ><Bell :size="21" /></NuxtLink>
        </header>
        <div v-if="store.demo && route.path != '/welcome'" class="demo-strip">
          <span class="status-dot" /> DEMO MODE · SAMPLE DATA
          <NuxtLink to="/welcome">Connect account ↗</NuxtLink>
        </div>
        <main><NuxtPage /></main>
        <nav v-if="route.path != '/welcome'" class="bottom-nav" aria-label="Main navigation">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            :class="{
              selected: route.path === tab.to || (tab.to !== '/' && route.path.startsWith(tab.to)),
            }"
            :aria-current="route.path === tab.to || (tab.to !== '/' && route.path.startsWith(tab.to)) ? 'page' : undefined"
            ><component :is="tab.icon" :size="21" /><span>{{ tab.label }}</span></NuxtLink
          >
        </nav>
      </template>
      <div v-else class="boot">
        <span class="brand-mark">//</span>
        <p>Loading your companion…</p>
      </div>
    </div>
    <div v-if="store.toast" class="toast" role="status">{{ store.toast }}</div>
  </div>
</template>
