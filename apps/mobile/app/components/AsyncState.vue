<script setup lang="ts">
defineProps<{ loading?: boolean; error?: string }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div v-if="loading" class="skeleton" role="status">Loading…</div>
  <div v-else-if="error" class="panel error" role="alert">
    <h3>Couldn't load this data</h3>
    <p>{{ error }}</p>
    <button class="button secondary" @click="$emit('retry')">Try again</button
    ><NuxtLink to="/profile">Account settings →</NuxtLink>
  </div>
  <slot v-else />
</template>
