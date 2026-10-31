<script setup lang="ts">
import { Search, Heart, Box, ChevronRight } from 'lucide-vue-next'
import type { CatalogItem } from '../../../../packages/types'
const store = useCompanion(),
  items = ref<CatalogItem[]>([]),
  selected = ref<CatalogItem | null>(null),
  tab = ref('Skins'),
  query = ref(''),
  category = ref('All'),
  error = ref(''),
  loading = ref(true),
  preview = ref(false)
async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await store.catalog()
    selected.value = items.value[0] || null
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
const filtered = computed(() =>
  items.value.filter(
    (i) =>
      (tab.value !== 'Favorites' || store.favorites.includes(i.id)) &&
      (category.value === 'All' || i.weapon === category.value) &&
      (i.name + ' ' + i.weapon).toLowerCase().includes(query.value.toLowerCase())
  )
)
function onPreviewKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') preview.value = false
}
watch(preview, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
onMounted(() => {
  void load()
  window.addEventListener('keydown', onPreviewKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onPreviewKeydown)
  document.body.style.overflow = ''
})
</script>
<template>
  <section class="page inventory">
    <div class="section-title">
      <h1>Inventory <Box class="gold" :size="23" /></h1>
      <span class="pill">CATALOG</span>
    </div>
    <div class="segmented">
      <button
        v-for="t in ['Skins', 'Loadouts', 'Favorites']"
        :key="t"
        :class="{ active: tab === t }"
        :aria-pressed="tab === t"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>
    <p class="fine-print">Original concept catalog · not your Steam inventory</p>
    <div v-if="tab === 'Loadouts'" class="panel empty">
      <Box :size="36" />
      <h2>Your loadout, coming later</h2>
      <p>Steam inventory ownership and loadout synchronization are not connected.</p>
    </div>
    <AsyncState v-else :loading="loading" :error="error" @retry="load"
      ><template v-if="selected"
        ><div class="skin-showcase">
          <div class="skin-topline">
            <span class="eyebrow">CONCEPT COLLECTION / 01</span
            ><button
              class="icon-button"
              :aria-label="
                store.favorites.includes(selected.id) ? 'Remove favorite' : 'Add favorite'
              "
              @click="store.toggleFavorite(selected.id)"
            >
              <Heart
                :size="21"
                :fill="store.favorites.includes(selected.id) ? 'currentColor' : 'none'"
              />
            </button>
          </div>
          <img :src="selected.image" :alt="selected.name + ' original illustration'" />
          <div>
            <span class="eyebrow">{{ selected.weapon }}</span>
            <h2>{{ selected.name }}</h2>
            <p>Original illustration · Concept finish</p>
          </div>
        </div>
        <div class="skin-thumbnails">
          <button
            v-for="item in items"
            :key="item.id"
            :class="{ active: selected.id === item.id }"
            :aria-pressed="selected.id === item.id"
            :aria-label="item.name"
            @click="selected = item"
          >
            <img :src="item.image" :alt="item.name" />
          </button>
        </div>
        <button class="button secondary" @click="preview = true">
          <Box :size="18" /> View illustration <ChevronRight :size="16" />
        </button>
        <div class="panel price-panel">
          <div>
            <small>Market price</small>
            <h2>Not available</h2>
          </div>
          <span class="pill">NO PRICE SOURCE</span>
        </div></template
      ><label class="search"
        ><Search :size="18" /><input
          v-model="query"
          aria-label="Search catalog"
          placeholder="Find a concept finish…" /></label
      ><select v-model="category" aria-label="Weapon category">
        <option>All</option>
        <option>Rifle</option>
        <option>Sniper</option></select
      ><button v-for="item in filtered" :key="item.id" class="catalog-row" @click="selected = item">
        <img :src="item.image" alt="" /><span
          ><b>{{ item.name }}</b
          ><small>{{ item.weapon }} · {{ item.rarity }}</small></span
        ><Heart v-if="store.favorites.includes(item.id)" :size="16" /><ChevronRight
          v-else
          :size="16"
        />
      </button>
      <p v-if="!filtered.length" class="empty">
        No items here yet. Add a favorite or change the filter.
      </p></AsyncState
    >
    <div v-if="preview && selected" class="modal-backdrop" @click.self="preview = false">
      <section role="dialog" aria-modal="true" aria-labelledby="preview-title" class="modal">
        <button class="icon-button" aria-label="Close preview" @click="preview = false">✕</button>
        <h2 id="preview-title">{{ selected.name }}</h2>
        <img :src="selected.image" :alt="selected.name" />
        <p>This is a 2D concept illustration. No 3D model is available.</p>
        <button class="button primary" @click="preview = false">Done</button>
      </section>
    </div>
  </section>
</template>
