<script setup lang="ts">
import { Shield, ShieldCheck, Swords, Dices, ArrowUpRight, ChevronRight } from 'lucide-vue-next'
import type { Stats, Match } from '../../../../packages/types'
const store = useCompanion(),
  stats = ref<Stats | null>(null),
  matches = ref<Match[]>([]),
  loading = ref(true),
  error = ref('')
async function load() {
  loading.value = true
  error.value = ''
  try {
    ;[stats.value, matches.value] = await Promise.all([store.stats(), store.matches()])
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
onMounted(load)
const modes = [
  { name: 'Competitive', icon: Shield },
  { name: 'Premier', icon: ShieldCheck },
  { name: 'Wingman', icon: Swords },
  { name: 'Casual', icon: Dices },
]
</script>
<template>
  <section class="page dashboard">
    <div class="greeting">
      <div>
        <p>Good to see you,</p>
        <h1>{{ store.profile?.nickname || 'Player' }} <span class="tiny-star">✦</span></h1>
      </div>
      <NuxtLink to="/profile" class="avatar"
        ><img v-if="store.profile?.avatar" :src="store.profile.avatar" alt="Steam avatar" /><span
          v-else
          >P</span
        ></NuxtLink
      >
    </div>
    <NuxtLink to="/inventory" class="promo"
      ><div>
        <span class="eyebrow">THE CONCEPT COLLECTION</span>
        <h2>Find your signature.</h2>
        <p>Explore the catalog <ArrowUpRight :size="14" /></p>
      </div>
      <img src="/art/sniper.svg" alt="Original golden sniper concept illustration"
    /></NuxtLink>
    <div class="modes">
      <button
        v-for="mode in modes"
        :key="mode.name"
        @click="
          store.message(
            mode.name +
              ' statistics are not available from the configured providers. FACEIT data is separate.'
          )
        "
      >
        <component :is="mode.icon" /><span>{{ mode.name }}</span>
      </button>
    </div>
    <AsyncState :loading="loading" :error="error" @retry="load"
      ><div class="section-title">
        <h2>Your stats</h2>
        <NuxtLink to="/stats"
          >{{ store.demo ? 'Sample' : 'FACEIT' }} <ChevronRight :size="14"
        /></NuxtLink>
      </div>
      <div class="stat-grid">
        <div class="stat-card">
          <small>K/D ratio</small><strong class="blue">{{ stats?.kd || '—' }}</strong>
        </div>
        <div class="stat-card">
          <small>Win rate</small
          ><strong class="gold">{{ stats?.winRate != null ? stats.winRate + '%' : '—' }}</strong>
        </div>
        <div class="stat-card">
          <small>Headshots</small><strong>{{ stats?.hs != null ? stats.hs + '%' : '—' }}</strong>
        </div>
      </div>
      <NuxtLink to="/stats" class="elo-card"
        ><span class="level-badge">{{ stats?.level || '—' }}</span>
        <div>
          <small>FACEIT LEVEL</small><b>{{ stats?.elo ?? '—' }} <span>ELO</span></b>
        </div>
        <div v-if="store.demo" class="mini-bars" aria-hidden="true">
          <i v-for="n in 12" :key="n" :style="{ height: 12 + ((n * 7) % 35) + 'px' }" />
        </div>
        <ChevronRight :size="18"
      /></NuxtLink>
      <div class="section-title">
        <h2>Recent matches</h2>
        <NuxtLink to="/matches">View all <ChevronRight :size="14" /></NuxtLink>
      </div>
      <div class="match-list">
        <MatchRow v-for="match in matches.slice(0, 3)" :key="match.id" :match="match" />
        <p v-if="!matches.length" class="empty">No matches available.</p>
      </div></AsyncState
    ><NuxtLink class="companion-callout" to="/companion"
      ><span class="status-dot muted" />
      <div>
        <strong>Match companion</strong>
        <p>See connection & supported features</p>
      </div>
      <ChevronRight :size="18"
    /></NuxtLink>
  </section>
</template>
