<script setup lang="ts">
import {
  ArrowUpRight,
  Target,
  ChartNoAxesCombined,
  Box,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from 'lucide-vue-next'
useRevealOnScroll()
const config = useRuntimeConfig(),
  light = ref(false)
useSeoMeta({
  title: 'CS2 Companion — Your next level starts here',
  description:
    'An independent CS2 companion. Explore FACEIT statistics, match history and an original concept catalog. Android packaging in development.',
})
const features = [
  {
    id: 'stats',
    number: '01',
    label: 'KNOW YOUR GAME',
    title: 'Every match.\nA little better.',
    copy: 'Connect your public FACEIT account, inspect lifetime statistics and build an ELO history from recorded snapshots.',
    icon: ChartNoAxesCombined,
    image: '/art/map.svg',
    to: '/stats',
  },
  {
    id: 'inventory',
    number: '02',
    label: 'FIND YOUR SIGNATURE',
    title: 'Style that\nstands apart.',
    copy: 'Browse original weapon concepts and save your favorites. Steam ownership, live pricing and trading are not enabled.',
    icon: Box,
    image: '/art/sniper.svg',
    to: '/inventory',
  },
  {
    id: 'companion',
    number: '03',
    label: 'STAY IN THE LOOP',
    title: 'Closer to\nyour next match.',
    copy: 'Read configured FACEIT status updates in the app. Remote match acceptance and Android push are not available.',
    icon: Target,
    image: '/art/operative.svg',
    to: '/companion',
  },
]
const faqs = [
  {
    q: 'Is CS2 Companion free?',
    a: 'The foundation is free to explore. There is no subscription or payment flow. Future monetization has not been decided.',
  },
  {
    q: 'Can I accept a CS2 match from my phone?',
    a: 'No. We have not established an authorized, tested match acceptance interface. You must accept in the official client. FACEIT status events are not the same as a native CS2 queue prompt.',
  },
  {
    q: 'Where does my data come from?',
    a: 'Steam OpenID verifies your identity. Public FACEIT Data API endpoints provide FACEIT statistics when configured. Demo data is visibly labeled and is never presented as live account data.',
  },
  {
    q: 'Can I trade or buy skins?',
    a: 'No. This release offers an original concept catalog and favorites only. It does not execute trades, accept payments or show invented prices.',
  },
  {
    q: 'Can I install it on Android?',
    a: 'Capacitor source and Android project preparation are included. A signed, verified public APK is not yet available. Use the browser demo while native delivery is being validated.',
  },
]
</script>
<template>
  <div>
    <section class="hero">
      <div class="hero-map" />
      <div class="hero-grid" />
      <div class="hero-copy">
        <span class="eyebrow"><i /> YOUR GAME. YOUR EDGE.</span>
        <h1>YOUR ULTIMATE<br /><span>CS2 COMPANION.</span></h1>
        <p>
          Track your progress. Analyze your matches.<br />Find your signature. Stay connected to
          your game.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/download" class="button primary"
            >Get the app <ArrowUpRight :size="18" /></NuxtLink
          ><a href="#features" class="button ghost">Explore features <ArrowRight :size="17" /></a>
        </div>
        <div class="hero-footnote">
          <ShieldCheck :size="14" /> FREE TO EXPLORE <span>•</span> STEAM SIGN-IN
          <span>•</span> EXPLICIT DEMO MODE
        </div>
      </div>
      <div class="hero-preview">
        <div class="preview-label">
          <span>PLAYER OVERVIEW</span><span class="demo-tag">SAMPLE DATA</span>
        </div>
        <div class="player-line">
          <span class="avatar">P</span>
          <div><strong>Player</strong><small>READY FOR THE NEXT ROUND</small></div>
          <span class="rank">8</span>
        </div>
        <div class="preview-stats">
          <div><small>K/D RATIO</small><b>1.24</b></div>
          <div>
            <small>WIN RATE</small><b>56<span>%</span></b>
          </div>
          <div><small>FACEIT ELO</small><b>1,842</b></div>
        </div>
        <svg viewBox="0 0 360 90" aria-label="Sample performance chart">
          <path d="M0 70H360M0 30H360" stroke="#ffffff10" />
          <path
            d="M0 72 30 59 60 65 90 38 120 48 150 30 180 40 210 18 240 25 270 10 300 16 330 3 360 9"
            fill="none"
            stroke="#ff8b2c"
            stroke-width="2"
          />
        </svg>
        <div class="preview-bottom">
          <span><i /> SAMPLE PERFORMANCE</span><span>YOUR NEXT LEVEL ↗</span>
        </div>
      </div>
      <div class="hero-bottom">
        <span>DESIGNED FOR THE GRIND. BUILT FOR THE CLIMB.</span
        ><a href="#features">SCROLL TO EXPLORE ↓</a>
      </div>
    </section>
    <div class="provider-strip">
      <span>ONE COMPANION. A CLEARER PICTURE.</span><b>STEAM <small>IDENTITY</small></b
      ><b>FACEIT <small>STATISTICS</small></b
      ><b>ANDROID <small>IN DEVELOPMENT</small></b>
    </div>
    <section id="features" class="section">
      <div class="section-heading" data-reveal>
        <div>
          <span class="eyebrow">LESS GUESSWORK. MORE GAME.</span>
          <h2>Everything around<br />your next great match.</h2>
        </div>
        <p>
          A focused space for your progress, your matches<br />and the details that make the game
          yours.
        </p>
      </div>
      <div class="feature-grid">
        <article
          v-for="feature in features"
          :id="feature.id"
          :key="feature.id"
          class="feature-card"
          data-reveal
        >
          <div class="feature-number">
            <component :is="feature.icon" :size="21" /><span>{{ feature.number }}</span>
          </div>
          <img :src="feature.image" alt="Original companion concept artwork" />
          <div class="feature-content">
            <span class="eyebrow">{{ feature.label }}</span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.copy }}</p>
            <a :href="config.public.mobileUrl + feature.to"
              >Explore in the app <ArrowUpRight :size="17"
            /></a>
          </div>
        </article>
      </div>
    </section>
    <section class="showcase section">
      <div class="showcase-copy" data-reveal>
        <span class="eyebrow">YOUR COMPANION. YOUR WAY.</span>
        <h2>Made for the<br />way you play.</h2>
        <p>
          Quick check between rounds. Deep dive after the session. A focused mobile interface with a
          little room to breathe.
        </p>
        <ul>
          <li><ShieldCheck :size="18" /> Steam sign-in without sharing your password</li>
          <li><ChartNoAxesCombined :size="18" /> FACEIT stats, with clear data sources</li>
          <li><Smartphone :size="18" /> Dark, light and system appearance</li>
        </ul>
        <div class="theme-switch">
          <button :class="{ active: !light }" @click="light = false">Dark mode</button
          ><button :class="{ active: light }" @click="light = true">Light mode</button>
        </div>
        <p class="fine">Illustrative app preview · sample data</p>
      </div>
      <div class="phone-mock" :class="{ light }" data-reveal>
        <div class="phone-camera" />
        <div class="mock-top">9:41 <span>▰ ▰ ▰</span></div>
        <div class="mock-greeting">
          <small>Good to see you,</small>
          <h3>Player <em>✦</em></h3>
        </div>
        <div class="mock-banner">
          <small>THE CONCEPT COLLECTION</small><b>Find your<br />signature.</b
          ><img src="/art/sniper.svg" alt="Original sniper concept" />
        </div>
        <div class="mock-modes">
          <span>◇<small>Competitive</small></span
          ><span>♢<small>Premier</small></span
          ><span>✧<small>Wingman</small></span
          ><span>◎<small>Casual</small></span>
        </div>
        <h4>Your stats</h4>
        <div class="mock-stats">
          <span><small>K/D ratio</small><b>1.24</b></span
          ><span><small>Win rate</small><b>56%</b></span
          ><span><small>Headshots</small><b>48%</b></span>
        </div>
        <h4>Recent matches</h4>
        <div class="mock-match">
          <span>◈</span>
          <div>Victory<small>Dust II</small></div>
          <b>13 : 9</b><em>W</em>
        </div>
        <div class="mock-match">
          <span>◈</span>
          <div>Defeat<small>Mirage</small></div>
          <b>8 : 13</b><em class="red">L</em>
        </div>
        <div class="mock-nav">
          <span>⌂<small>Home</small></span
          ><span>▥<small>Stats</small></span
          ><span>◎<small>Matches</small></span
          ><span>◇<small>Inventory</small></span
          ><span>♙<small>Profile</small></span>
        </div>
      </div>
    </section>
    <section id="faq" class="faq section" data-reveal>
      <div>
        <span class="eyebrow">BEFORE YOU QUEUE UP</span>
        <h2>Good questions.<br />Clear answers.</h2>
      </div>
      <div>
        <details v-for="faq in faqs" :key="faq.q">
          <summary>{{ faq.q }}<span>+</span></summary>
          <p>{{ faq.a }}</p>
        </details>
      </div>
    </section>
    <section class="closing">
      <span class="eyebrow">THE NEXT ROUND STARTS WITH YOU.</span>
      <h2>KNOW YOUR GAME.<br /><em>OWN YOUR PROGRESS.</em></h2>
      <NuxtLink to="/download" class="button primary"
        >Explore CS2 Companion <ArrowUpRight :size="18"
      /></NuxtLink>
      <p>Free foundation. No payments. No invented live data.</p>
    </section>
  </div>
</template>
