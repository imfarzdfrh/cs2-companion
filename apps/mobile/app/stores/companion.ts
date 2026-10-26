import { defineStore } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { ApiError } from '../../../../packages/api-client'
import { createApi } from '../../../../packages/api-client'
import type { Profile, Stats, Match, CatalogItem, Notice } from '../../../../packages/types'

export const useCompanion = defineStore('companion', () => {
  const config = useRuntimeConfig()
  const profile = ref<Profile | null>(null),
    demo = ref(false),
    ready = ref(false),
    theme = ref('system'),
    favorites = ref<string[]>([])
  const toast = ref(''),
    search = ref(''),
    connectionIssue = ref(false)
  const api = createApi(config.public.apiBase, () => profile.value?.csrf || '')
  // Session discovery must not hold a native WebView on its splash screen.
  const bootstrapApi = createApi(config.public.apiBase, () => profile.value?.csrf || '', 3500)
  let themeListenerAdded = false
  function message(value: string) {
    toast.value = value
    setTimeout(() => {
      if (toast.value === value) toast.value = ''
    }, 4000)
  }
  function applyTheme() {
    const dark =
      theme.value === 'dark' ||
      (theme.value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }
  function setTheme(value: string) {
    theme.value = value
    localStorage.setItem('cs2-theme', value)
    applyTheme()
  }
  function restoreDemoFavorites() {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('cs2-favorites') || '[]')
      favorites.value = Array.isArray(saved)
        ? saved.filter((value): value is string => typeof value === 'string')
        : []
    } catch {
      favorites.value = []
    }
  }

  async function init() {
    const savedTheme = localStorage.getItem('cs2-theme')
    theme.value = ['light', 'dark', 'system'].includes(savedTheme || '')
      ? savedTheme!
      : 'system'
    applyTheme()
    if (!themeListenerAdded) {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
      themeListenerAdded = true
    }
    demo.value = localStorage.getItem('cs2-demo') === 'true'
    connectionIssue.value = false

    // Native account exchange has not been implemented yet. Do not request
    // a browser-cookie session from the unreachable demo APK endpoint.
    if (demo.value || Capacitor.isNativePlatform()) {
      profile.value = null
      if (demo.value) restoreDemoFavorites()
      ready.value = true
      return
    }

    try {
      profile.value = await bootstrapApi<Profile>('/v1/me')
      // Favorites are secondary data: never gate first paint on this request.
      void api<string[]>('/v1/favorites')
        .then((items) => { if (!demo.value && profile.value) favorites.value = items })
        .catch(() => { /* Favorites can be retried from the catalog. */ })
    } catch (error) {
      profile.value = null
      favorites.value = []
      // A 401 means not signed in; offline/invalid backend is a separate state.
      connectionIssue.value = !(error instanceof ApiError && error.status === 401)
    } finally {
      ready.value = true
    }
  }
  function startDemo() {
    demo.value = true
    profile.value = null
    connectionIssue.value = false
    restoreDemoFavorites()
    localStorage.setItem('cs2-demo', 'true')
    void navigateTo('/')
  }
  async function logout() {
    if (profile.value) await api('/v1/auth/logout', 'POST')
    profile.value = null
    demo.value = false
    localStorage.removeItem('cs2-demo')
    navigateTo('/welcome')
  }
  async function toggleFavorite(id: string) {
    const exists = favorites.value.includes(id)
    try {
      if (!demo.value) await api('/v1/favorites/' + id, exists ? 'DELETE' : 'PUT')
      favorites.value = exists ? favorites.value.filter((x) => x !== id) : [...favorites.value, id]
      if (demo.value) localStorage.setItem('cs2-favorites', JSON.stringify(favorites.value))
    } catch (e) {
      message((e as Error).message)
    }
  }
  const demoMatches: Match[] = [
    { id: 'demo-1', map: 'Dust II', result: 'Victory', score: '13 : 9', date: 1792317600 },
    { id: 'demo-2', map: 'Mirage', result: 'Defeat', score: '8 : 13', date: 1792231200 },
    { id: 'demo-3', map: 'Inferno', result: 'Victory', score: '13 : 11', date: 1792144800 },
    { id: 'demo-4', map: 'Ancient', result: 'Victory', score: '13 : 7', date: 1792058400 },
  ]
  const demoCatalog: CatalogItem[] = [
    {
      id: 'amber',
      name: 'Amber Circuit',
      weapon: 'Rifle',
      rarity: 'Concept',
      exterior: 'Not applicable',
      image: '/art/rifle.svg',
      owned: false,
      price: null,
    },
    {
      id: 'blue',
      name: 'Midnight Signal',
      weapon: 'Sniper',
      rarity: 'Concept',
      exterior: 'Not applicable',
      image: '/art/sniper.svg',
      owned: false,
      price: null,
    },
    {
      id: 'gold',
      name: 'Golden Hour',
      weapon: 'Rifle',
      rarity: 'Concept',
      exterior: 'Not applicable',
      image: '/art/rifle.svg',
      owned: false,
      price: null,
    },
  ]
  async function stats(): Promise<Stats> {
    return demo.value
      ? {
          source: 'demo',
          kd: '1.24',
          winRate: '56',
          hs: '48',
          elo: 1842,
          level: 8,
          matches: '248',
          streak: '3',
        }
      : api<Stats>('/v1/stats')
  }
  async function matches(offset = 0): Promise<Match[]> {
    return demo.value
      ? offset
        ? []
        : demoMatches
      : (await api<{ items: Match[] }>('/v1/matches?offset=' + offset)).items
  }
  async function catalog() {
    return demo.value ? demoCatalog : (await api<{ items: CatalogItem[] }>('/v1/catalog')).items
  }
  async function notifications(): Promise<Notice[]> {
    return demo.value
      ? [
          {
            id: 1,
            title: 'Welcome to demo mode. These are sample notifications.',
            read: false,
            date: '2026-10-18T12:00:00Z',
          },
        ]
      : api<Notice[]>('/v1/notifications')
  }
  return {
    profile,
    demo,
    ready,
    theme,
    connectionIssue,
    favorites,
    toast,
    search,
    api,
    message,
    init,
    setTheme,
    startDemo,
    logout,
    toggleFavorite,
    stats,
    matches,
    catalog,
    notifications,
    demoMatches,
  }
})
