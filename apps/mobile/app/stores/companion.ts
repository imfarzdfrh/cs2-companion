import { defineStore } from 'pinia'
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
    search = ref('')
  const api = createApi(config.public.apiBase, () => profile.value?.csrf || '')
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
  async function init() {
    theme.value = localStorage.getItem('cs2-theme') || 'system'
    applyTheme()
    if (!ready.value)
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
    demo.value = localStorage.getItem('cs2-demo') === 'true'
    try {
      profile.value = await api<Profile>('/v1/me')
      demo.value = false
      favorites.value = await api<string[]>('/v1/favorites')
    } catch {
      profile.value = null
    }
    if (demo.value) {
      try {
        const saved = JSON.parse(localStorage.getItem('cs2-favorites') || '[]')
        favorites.value = Array.isArray(saved)
          ? saved.filter((v: unknown) => typeof v === 'string')
          : []
      } catch {
        favorites.value = []
      }
    }
    ready.value = true
  }
  function startDemo() {
    demo.value = true
    profile.value = null
    localStorage.setItem('cs2-demo', 'true')
    navigateTo('/')
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
