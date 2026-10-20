<script setup lang="ts">
import type { Match } from '../../../../../packages/types'
interface PlayerLine {
  id: string
  nickname: string
  map?: string
  kills: string | null
  deaths: string | null
  assists: string | null
  kd: string | null
  hs: string | null
}
interface MatchDetail extends Match {
  players: PlayerLine[]
  eloChange: number | null
  timeline: unknown
}
const route = useRoute(),
  store = useCompanion(),
  match = ref<MatchDetail | null>(null),
  error = ref(''),
  loading = ref(true)
async function load() {
  loading.value = true
  error.value = ''
  try {
    if (store.demo) {
      const found = store.demoMatches.find((m) => m.id === route.params.id)
      if (!found) throw new Error('Sample match not found')
      match.value = {
        ...found,
        players: [
          {
            id: 'sample',
            nickname: 'Demo Player',
            kills: '26',
            deaths: '18',
            assists: '7',
            kd: '1.44',
            hs: '46',
          },
        ],
        eloChange: null,
        timeline: null,
      }
    } else
      match.value = await store.api('/v1/matches/' + encodeURIComponent(String(route.params.id)))
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
const score = computed(() =>
  typeof match.value?.score === 'object' && match.value.score
    ? Object.values(match.value.score).join(' : ')
    : match.value?.score || '—'
)
onMounted(load)
</script>
<template>
  <section class="page">
    <AsyncState :loading="loading" :error="error" @retry="load"
      ><div class="match-hero">
        <span class="eyebrow">{{ store.demo ? 'SAMPLE MATCH' : 'FACEIT MATCH' }}</span>
        <h1>{{ match?.map || 'Match details' }}</h1>
        <strong :class="match?.result === 'Defeat' ? 'loss' : 'win'">{{
          match?.result || match?.status || 'Official record'
        }}</strong>
        <div class="scoreboard">{{ score }}</div>
      </div>
      <div class="panel">
        <h2>Match summary</h2>
        <p v-if="match?.date">{{ new Date(match.date * 1000).toLocaleString() }}</p>
        <p class="note">Per-match ELO change and round timeline are unavailable.</p>
        <a
          v-if="!store.demo"
          :href="
            'https://www.faceit.com/en/cs2/room/' + encodeURIComponent(String(route.params.id))
          "
          target="_blank"
          rel="noopener noreferrer"
          class="button primary"
          >Open official match ↗</a
        >
      </div>
      <div v-for="player in match?.players" :key="player.id + (player.map || '')" class="panel">
        <div class="section-title">
          <h2>{{ player.nickname }}</h2>
          <small>{{ player.map || 'Performance' }}</small>
        </div>
        <div class="stat-grid">
          <div class="stat-card">
            <small>Kills</small><strong>{{ player.kills ?? '—' }}</strong>
          </div>
          <div class="stat-card">
            <small>Deaths</small><strong>{{ player.deaths ?? '—' }}</strong>
          </div>
          <div class="stat-card">
            <small>Assists</small><strong>{{ player.assists ?? '—' }}</strong>
          </div>
        </div>
        <p class="note">K/D {{ player.kd ?? '—' }} · Headshots {{ player.hs ?? '—' }}%</p>
      </div>
      <p v-if="!match?.players.length" class="empty">
        Individual statistics are not available for this match.
      </p></AsyncState
    >
  </section>
</template>
