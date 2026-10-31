<script setup lang="ts">
import { ShieldCheck, Link, LogOut, ChevronRight, SunMoon } from 'lucide-vue-next'
const store = useCompanion(),
  sound = ref(true),
  vibration = ref(true),
  busy = ref(false)
async function connect() {
  busy.value = true
  try {
    await store.api('/v1/accounts/faceit', 'POST')
    await store.refreshProfile()
    store.message('FACEIT public account linked using your verified SteamID')
  } catch (e) {
    store.message((e as Error).message)
  } finally {
    busy.value = false
  }
}
async function disconnect() {
  try {
    await store.api('/v1/accounts/faceit', 'DELETE')
    await store.refreshProfile()
  } catch (e) {
    store.message((e as Error).message)
  }
}
async function save() {
  try {
    if (!store.demo)
      await store.api('/v1/settings', 'PUT', {
        sound: sound.value,
        vibration: vibration.value,
        sync_alerts: true,
        theme: store.theme,
      })
    else
      localStorage.setItem(
        'cs2-preferences',
        JSON.stringify({ sound: sound.value, vibration: vibration.value })
      )
    store.message('Preferences saved')
  } catch (e) {
    store.message((e as Error).message)
  }
}
onMounted(() => {
  let prefs: { sound?: boolean; vibration?: boolean } = {}
  if (store.demo) {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('cs2-preferences') || '{}')
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        prefs = saved as { sound?: boolean; vibration?: boolean }
      }
    } catch {
      // Ignore corrupt local preferences and keep safe defaults.
    }
  } else {
    prefs = (store.profile?.settings || {}) as { sound?: boolean; vibration?: boolean }
  }
  sound.value = prefs.sound !== false
  vibration.value = prefs.vibration !== false
})
</script>
<template>
  <section class="page">
    <span class="eyebrow">MAKE IT YOURS</span>
    <h1>Your profile</h1>
    <div class="profile-card panel">
      <div class="avatar large">
        <img v-if="store.profile?.avatar" :src="store.profile.avatar" alt="Steam avatar" /><span
          v-else
          >P</span
        >
      </div>
      <h2>{{ store.profile?.nickname || 'Demo Player' }}</h2>
      <p>{{ store.profile?.steamId || 'No account connected' }}</p>
      <span class="pill">{{ store.demo ? 'EXPLORER' : 'STEAM VERIFIED' }}</span>
    </div>
    <div class="section-title">
      <h2>Connected accounts</h2>
      <Link :size="17" />
    </div>
    <div class="panel">
      <div class="settings-row">
        <ShieldCheck class="gold" />
        <div>
          <strong>Steam</strong
          ><small>{{ store.profile ? 'Connected securely' : 'Not connected' }}</small>
        </div>
        <NuxtLink v-if="!store.profile" to="/welcome">Connect ↗</NuxtLink>
      </div>
      <div class="settings-row">
        <span class="faceit-logo">❯</span>
        <div>
          <strong>FACEIT</strong
          ><small>{{
            store.profile?.faceitId ? 'Public account associated' : 'Connect using your SteamID'
          }}</small>
        </div>
        <button v-if="store.profile && !store.profile.faceitId" :disabled="busy" @click="connect">
          {{ busy ? '…' : 'Connect' }}</button
        ><button v-else-if="store.profile?.faceitId" @click="disconnect">Unlink</button
        ><span v-else class="pill">DEMO</span>
      </div>
    </div>
    <div class="section-title">
      <h2>Appearance</h2>
      <SunMoon :size="18" />
    </div>
    <div class="segmented">
      <button
        v-for="t in ['dark', 'light', 'system']"
        :key="t"
        :class="{ active: store.theme === t }"
        :aria-pressed="store.theme === t"
        @click="store.setTheme(t)"
      >
        {{ t }}
      </button>
    </div>
    <div class="panel">
      <h2>Notification preferences</h2>
      <label class="settings-row"><span>Sound</span><input v-model="sound" type="checkbox" /></label
      ><label class="settings-row"
        ><span>Vibration</span><input v-model="vibration" type="checkbox"
      /></label>
      <p class="fine-print">Preferences are saved. Device push delivery is not configured.</p>
      <button class="button secondary" @click="save">Save preferences</button>
    </div>
    <NuxtLink to="/companion" class="settings-row panel"
      ><span>Match companion capabilities</span><ChevronRight :size="18" /></NuxtLink
    ><button
      class="button text-button"
      @click="store.logout().catch((e) => store.message(e.message))"
    >
      <LogOut :size="18" /> {{ store.demo ? 'Exit demo' : 'Sign out' }}
    </button>
    <p class="fine-print centered">CS2 COMPANION · FOUNDATION 0.1.0</p>
  </section>
</template>
