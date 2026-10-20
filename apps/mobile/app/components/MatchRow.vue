<script setup lang="ts">
import type { Match } from '../../../../packages/types'
defineProps<{ match: Match }>()
</script>
<template>
  <NuxtLink :to="'/matches/' + match.id" class="match-row"
    ><span class="map-icon" :class="match.map?.toLowerCase().replace(' ', '')">{{
      (match.map || 'F').slice(0, 1)
    }}</span
    ><span class="match-name"
      ><strong>{{ match.result || match.status || 'FACEIT match' }}</strong
      ><small>{{ match.map || new Date(match.date * 1000).toLocaleDateString() }}</small></span
    ><b>{{
      typeof match.score === 'object' && match.score
        ? Object.values(match.score).join(' : ')
        : match.score || '—'
    }}</b
    ><span :class="match.result === 'Defeat' ? 'loss' : 'win'">{{
      match.result === 'Victory' ? 'W' : match.result === 'Defeat' ? 'L' : '↗'
    }}</span></NuxtLink
  >
</template>
