<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import type { Notice } from '../../../../packages/types'
const store = useCompanion(),
  items = ref<Notice[]>([]),
  loading = ref(true),
  error = ref('')
async function load() {
  loading.value = true
  try {
    items.value = await store.notifications()
    error.value = ''
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
async function read(item: Notice) {
  try {
    if (!store.demo) await store.api('/v1/notifications/' + item.id + '/read', 'POST')
    item.read = true
  } catch (e) {
    store.message((e as Error).message)
  }
}
onMounted(load)
</script>
<template>
  <section class="page">
    <span class="eyebrow">STAY IN THE LOOP</span>
    <h1>Notifications</h1>
    <AsyncState :loading="loading" :error="error" @retry="load"
      ><button
        v-for="item in items"
        :key="item.id"
        class="notice panel"
        :class="{ unread: !item.read }"
        @click="read(item)"
      >
        <Bell :size="20" /><span
          ><strong>{{ item.title }}</strong
          ><small
            >{{ new Date(item.date).toLocaleString() }} ·
            {{ item.read ? 'Read' : 'Tap to mark read' }}</small
          ></span
        >
      </button>
      <div v-if="!items.length" class="empty panel">
        <Bell />
        <h2>You're all caught up</h2>
        <p>Verified provider events and sync updates will appear here.</p>
      </div></AsyncState
    >
  </section>
</template>
