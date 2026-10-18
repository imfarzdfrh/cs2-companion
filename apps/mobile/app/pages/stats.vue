<script setup lang="ts">
import type { Stats } from '../../../../packages/types'
const store = useCompanion(),
  data = ref<Stats | null>(null),
  days = ref(30),
  points = ref<{ elo: number; date: string }[]>([]),
  error = ref(''),
  loading = ref(true)
async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await store.stats()
    points.value = store.demo
      ? [1680, 1710, 1692, 1750, 1740, 1782, 1810, 1790, 1842].map((elo, i) => ({
          elo,
          date: new Date(Date.UTC(2026, 9, 10 + i)).toISOString(),
        }))
      : await store.api('/v1/snapshots?days=' + days.value)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
const line = computed(() => {
  const values = points.value.map((p) => p.elo)
  const min = Math.min(...values) - 20,
    max = Math.max(...values) + 20
  return values
    .map(
      (v, i) =>
        `${20 + (i * 300) / Math.max(1, values.length - 1)},${135 - ((v - min) / (max - min)) * 105}`
    )
    .join(' ')
})
onMounted(load)
watch(days, load)
</script>
<template>
  <section class="page">
    <span class="eyebrow">THE BIGGER PICTURE</span>
    <h1>Your progress</h1>
    <p class="subtitle">Every match tells a story.</p>
    <div class="segmented">
      <button
        v-for="period in [
          { v: 7, t: '7 days' },
          { v: 30, t: '30 days' },
          { v: 90, t: '90 days' },
          { v: 0, t: 'All time' },
        ]"
        :key="period.v"
        :class="{ active: days === period.v }"
        @click="days = period.v"
      >
        {{ period.t }}
      </button>
    </div>
    <AsyncState :loading="loading" :error="error" @retry="load"
      ><div class="panel chart-panel">
        <div class="section-title">
          <span>FACEIT ELO</span><span class="pill">LEVEL {{ data?.level ?? '—' }}</span>
        </div>
        <strong class="big-number">{{ data?.elo ?? '—' }}</strong
        ><svg
          v-if="points.length > 1"
          viewBox="0 0 340 160"
          role="img"
          aria-label="ELO snapshot history"
        >
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#f2a633" stop-opacity=".3" />
              <stop offset="1" stop-color="#f2a633" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M20 40H320 M20 85H320 M20 130H320" stroke="currentColor" opacity=".09" />
          <polygon :points="'20,155 ' + line + ' 320,155'" fill="url(#area)" />
          <polyline
            :points="line"
            fill="none"
            stroke="#f2a633"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p v-else class="empty">
          History starts with your first sync. At least two snapshots are needed.
        </p>
        <p class="fine-print">
          {{
            store.demo
              ? 'Illustrative demo history; period buttons do not represent live measurements.'
              : 'Recorded snapshots, not per-match ELO changes.'
          }}
        </p>
      </div>
      <div class="stat-grid stats-six">
        <div
          v-for="metric in [
            { label: 'K/D ratio', value: data?.kd },
            { label: 'Win rate', value: data?.winRate ? data.winRate + '%' : null },
            { label: 'Headshots', value: data?.hs ? data.hs + '%' : null },
            { label: 'Matches', value: data?.matches },
            { label: 'Win streak', value: data?.streak },
            { label: 'K/R', value: null },
          ]"
          :key="metric.label"
          class="stat-card"
        >
          <small>{{ metric.label }}</small
          ><strong>{{ metric.value ?? '—' }}</strong>
        </div>
      </div>
      <div class="panel">
        <h2>Keep the momentum</h2>
        <p class="subtitle">Your next milestone: build a history worth learning from.</p>
        <p class="note">
          Lifetime metrics come from FACEIT. Period filters apply to saved ELO snapshots only.
          Unavailable metrics remain blank.
        </p>
      </div></AsyncState
    >
  </section>
</template>
