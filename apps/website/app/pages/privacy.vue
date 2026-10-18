<script setup lang="ts">
useSeoMeta({ title: 'Privacy & your data — CS2 Companion' })
</script>
<template>
  <section class="document">
    <span class="eyebrow">CS2 COMPANION</span>
    <h1>Privacy & your data</h1>
    <p>
      Steam sign-in verifies your SteamID. The backend stores your SteamID, display name, avatar,
      session hashes, associated FACEIT player ID, preferences, favorites, ELO snapshots and
      notifications. API credentials remain on the server. Demo preferences are stored locally in
      your browser. Signing out revokes the active server session. No advertising or payment
      integration is included. This development foundation is not yet a public production service.
      Before public launch, the operator must add its identity, contact address, retention policy
      and an account deletion/export process.
    </p>
    <a href="https://github.com/imfarzdfrh/cs2-companion" class="button ghost"
      >Project documentation ↗</a
    >
  </section>
</template>
