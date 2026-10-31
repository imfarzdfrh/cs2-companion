import { defineStore } from 'pinia'
import { ApiError, createApi } from '../../../../packages/api-client'
import type { Profile, Stats, Match, CatalogItem, Notice } from '../../../../packages/types'

export const useCompanion = defineStore('companion', () => {
  const config = useRuntimeConfig()
  const profile = ref<Profile | null>(null)
  const demo = ref(false)
  const ready = ref(false)
  const theme = ref('system')
  const favorites = ref<string[]>([])
  const toast = ref('')
  const search = ref('')
  const connectionIssue = ref(false)

  const api = createApi(config.public.apiBase, () => profile.value?.csrf || '')
  const bootstrapApi = createApi(config.public.apiBase, () => profile.value?.csrf || '', 4500)
  let initTask: Promise<void> | null = null
  let themeMedia: MediaQueryList | null = null

  function readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  function writeStorage(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      message('Browser storage is unavailable. Some preferences may not persist.')
    }
  }

  function removeStorage(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Continue signing out locally even when browser storage is restricted.
    }
  }

  function message(value: string) {
    toast.value = value
    setTimeout(() => {
      if (toast.value === value) toast.value = ''
    }, 4000)
  }

  function applyTheme() {
    if (typeof document === 'undefined') return
    const prefersDark = themeMedia?.matches ?? true
    const dark = theme.value === 'dark' || (theme.value === 'system' && prefersDark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }

  function setTheme(value: string) {
    if (!['system', 'dark', 'light'].includes(value)) return
    theme.value = value
    writeStorage('cs2-theme', value)
    applyTheme()
  }

  function restoreDemoFavorites() {
    try {
      const saved: unknown = JSON.parse(readStorage('cs2-favorites') || '[]')
      favorites.value = Array.isArray(saved)
        ? saved.filter((item): item is string => typeof item === 'string')
        : []
    } catch {
      favorites.value = []
    }
  }

  async function refreshProfile() {
    profile.value = await api<Profile>('/v1/me')
    connectionIssue.value = false
    return profile.value
  }

  function init(skipSession = false): Promise<void> {
    if (ready.value) return Promise.resolve()
    if (initTask) return initTask

    initTask = (async () => {
      try {
        const savedTheme = readStorage('cs2-theme')
        theme.value = ['system', 'dark', 'light'].includes(savedTheme || '')
          ? savedTheme!
          : 'system'
        themeMedia = window.matchMedia('(prefers-color-scheme: dark)')
        themeMedia.addEventListener('change', applyTheme)
        applyTheme()

        demo.value = readStorage('cs2-demo') === 'true'

        // Demo mode is local by design: never wait for a backend request to show sample screens.
        if (demo.value || skipSession) {
          profile.value = null
          if (demo.value) {
            restoreDemoFavorites()
          } else {
            // Keep the welcome screen instant; verify backend reachability in the background.
            void bootstrapApi<{ status: string }>('/health')
              .then(() => { connectionIssue.value = false })
              .catch(() => { connectionIssue.value = true })
          }
          return
        }

        try {
          profile.value = await bootstrapApi<Profile>('/v1/me')
          connectionIssue.value = false
          // Favorites are secondary data; do not delay the first screen for them.
          void api<string[]>('/v1/favorites')
            .then((items) => {
              if (!demo.value && profile.value) favorites.value = items
            })
            .catch(() => {
              // A favorites failure must not block the dashboard.
            })
        } catch (error) {
          profile.value = null
          favorites.value = []
          connectionIssue.value = !(error instanceof ApiError && error.status === 401)
        }
      } finally {
        ready.value = true
      }
    })()

    return initTask
  }

  function startDemo() {
    demo.value = true
    profile.value = null
    connectionIssue.value = false
    restoreDemoFavorites()
    writeStorage('cs2-demo', 'true')
    ready.value = true
    void navigateTo('/')
  }

  async function logout() {
    try {
      if (profile.value) await api('/v1/auth/logout', 'POST')
    } finally {
      profile.value = null
      demo.value = false
      favorites.value = []
      connectionIssue.value = false
      removeStorage('cs2-demo')
      removeStorage('cs2-favorites')
      void navigateTo('/welcome')
    }
  }

  async function toggleFavorite(id: string) {
    const exists = favorites.value.includes(id)
    try {
      if (!demo.value) {
        await api('/v1/favorites/' + encodeURIComponent(id), exists ? 'DELETE' : 'PUT')
      }
      favorites.value = exists
        ? favorites.value.filter((item) => item !== id)
        : [...favorites.value, id]
      if (demo.value) writeStorage('cs2-favorites', JSON.stringify(favorites.value))
    } catch (error) {
      message((error as Error).message || 'Could not update favorite')
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
    connectionIssue,
    api,
    message,
    init,
    refreshProfile,
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
