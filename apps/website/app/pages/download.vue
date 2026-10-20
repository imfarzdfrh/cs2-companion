<script setup lang="ts">
const config = useRuntimeConfig()
useSeoMeta({ title: 'Get CS2 Companion — Browser demo & Android source' })
</script>
<template>
  <section class="document">
    <span class="eyebrow">TAKE YOUR GAME WITH YOU</span>
    <h1>Your next round,<br />in your pocket.</h1>
    <p>
      The browser app is ready for local development. Explore explicit demo data, or connect Steam
      and FACEIT after configuring the backend.
    </p>
    <a class="button primary" :href="config.public.mobileUrl + '/welcome'">Open companion →</a>
    <div class="info-grid">
      <article>
        <h2>Android</h2>
        <p>
          Capacitor packaging is under development. No verified public APK is available. Build
          instructions and source are in the repository.
        </p>
        <a
          href="https://github.com/imfarzdfrh/cs2-companion"
          target="_blank"
          rel="noopener noreferrer"
          >View source ↗</a
        >
      </article>
      <article>
        <h2>iOS</h2>
        <p>
          Future preparation only. iOS packaging has not been tested and requires macOS and Xcode.
        </p>
      </article>
    </div>
  </section>
</template>
