export type MatchCompanionStatus =
  | 'disconnected'
  | 'connected'
  | 'waiting'
  | 'match_found'
  | 'notification_sent'
  | 'accept_available'
  | 'accepted'
  | 'expired'
  | 'unsupported'
export interface Profile {
  id: number
  nickname: string
  avatar: string
  steamId: string
  faceitId: string | null
  csrf: string
  settings: Record<string, unknown>
}
export interface Stats {
  source: 'demo' | 'faceit'
  kd: string | null
  winRate: string | null
  hs: string | null
  elo: number | null
  level: number | null
  matches?: string | null
  streak?: string | null
}
export interface Match {
  id: string
  map?: string
  result?: 'Victory' | 'Defeat'
  score: string | Record<string, number> | null
  date: number
  url?: string
  status?: string
}
export interface CatalogItem {
  id: string
  name: string
  weapon: string
  rarity: string
  exterior: string
  image: string
  owned: boolean
  price: number | null
}
export interface Notice {
  id: number
  title: string
  read: boolean
  date: string
}
