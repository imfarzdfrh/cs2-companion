<script setup lang="ts">
import { MonitorSmartphone, ShieldAlert } from 'lucide-vue-next'
</script>
<template>
  <section class="page">
    <span class="eyebrow">CONNECTED, HONESTLY</span>
    <h1>Match companion</h1>
    <div class="panel companion-status">
      <MonitorSmartphone :size="64" /><span class="pill">UNSUPPORTED ACCEPTANCE</span>
      <h2>Stay close to the match.</h2>
      <p>
        Remote acceptance is not available. Confirm your match inside CS2 or the official FACEIT
        client.
      </p>
    </div>
    <div class="panel">
      <h2><ShieldAlert :size="20" /> What works today?</h2>
      <ul>
        <li>In-app notifications from configured, authenticated FACEIT status webhooks.</li>
        <li>Statistics synchronization notifications.</li>
        <li>Official FACEIT match links.</li>
      </ul>
      <p class="note">
        FACEIT “match ready” is not proof that a native CS2 “Accept” prompt is waiting. No Windows
        companion is paired, and device push delivery is not enabled.
      </p>
    </div>
    <NuxtLink to="/notifications" class="button primary">Open notification center</NuxtLink>
  </section>
</template>
