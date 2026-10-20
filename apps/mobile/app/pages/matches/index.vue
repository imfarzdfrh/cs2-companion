<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { Match } from '../../../../../packages/types'
const store = useCompanion(),
  items = ref<Match[]>([]),
  query = ref(''),
  filter = ref('All'),
  loading = ref(true),
  error = ref(''),
  offset = ref(0),
  hasMore = ref(true)
async function load(more = false) {
  loading.value = true
  error.value = ''
  try {
    const next = more ? offset.value + 20 : 0
    const batch = await store.matches(next)
    items.value = more ? [...items.value, ...batch] : batch
    offset.value = next
    hasMore.value = batch.length === 20
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
const filtered = computed(() =>
  items.value.filter(
    (m) =>
      (filter.value === 'All' || m.result === filter.value) &&
      ((m.map || '') + m.id).toLowerCase().includes(query.value.toLowerCase())
  )
)
onMounted(() => load())
</script>
<template>
  <section class="page">
    <span class="eyebrow">ROUND BY ROUND</span>
    <h1>Match history</h1>
    <p class="subtitle">The wins. The lessons. The next one.</p>
    <label class="search"
      ><Search :size="18" /><input
        v-model="query"
        placeholder="Search map or match ID"
        aria-label="Search matches"
    /></label>
    <div v-if="store.demo" class="segmented">
      <button
        v-for="value in ['All', 'Victory', 'Defeat']"
        :key="value"
        :class="{ active: filter === value }"
        @click="filter = value"
      >
        {{ value }}
      </button>
    </div>
    <AsyncState :loading="loading" :error="error" @retry="load()"
      ><div class="section-title">
        <h2>{{ store.demo ? 'SAMPLE MATCHES' : 'FACEIT MATCHES' }}</h2>
        <small>{{ filtered.length }} matches</small>
      </div>
      <MatchRow v-for="match in filtered" :key="match.id" :match="match" />
      <p v-if="!filtered.length" class="empty">No matches found. Try another search.</p>
      <button v-if="hasMore" class="button secondary" @click="load(true)">
        Load more
      </button></AsyncState
    >
  </section>
</template>
