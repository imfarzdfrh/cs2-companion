import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
      mobileUrl: process.env.NUXT_PUBLIC_MOBILE_URL || 'http://localhost:3000',
    },
  },
  app: {
    head: {
      title: 'CS2 Companion',
      meta: [{ name: 'description', content: 'Your stats. Your progress. Your game.' }],
    },
  },
})
