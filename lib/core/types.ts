import type { AIProviderKind } from './constants'

export type ChangelogStatus = 'draft' | 'published'
export type ChangelogTag = 'Features' | 'Fixes' | 'Improvements' | 'Breaking' | 'Security' | 'Performance' | 'Docs'

export interface ChangelogEntry {
  _id: string
  title: string
  slug: string
  content: string
  version: string
  date: Date
  status: ChangelogStatus
  tags: ChangelogTag[]
  aiGenerated: boolean
  rawNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateChangelogInput {
  title: string
  content: string
  version: string
  status: ChangelogStatus
  tags: ChangelogTag[]
  rawNotes?: string
  aiGenerated?: boolean
}

export interface UpdateChangelogInput {
  id: string
  title?: string
  content?: string
  version?: string
  status?: ChangelogStatus
  tags?: ChangelogTag[]
}

export interface EnhanceChangelogInput {
  rawNotes: string
  currentVersion?: string
}

export interface EnhanceChangelogOutput {
  title: string
  content: string
  tags: ChangelogTag[]
}

export interface FeedResponse {
  entries: ChangelogEntry[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
}

export interface AdminUser {
  _id: string
  email: string
  passwordHash: string
  displayName: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterAdminInput {
  email: string
  password: string
  displayName?: string
}

export interface AISettingsInput {
  provider: AIProviderKind
  model: string
  openaiApiKey?: string
  geminiApiKey?: string
  ollamaBaseUrl?: string
}

export interface AIModelOption {
  id: string
  name: string
}

export interface ChangelogSettingsInput {
  defaultFeedPageSize: number
  autoPublish: boolean
}

export interface PersistedAISettings {
  provider: AIProviderKind
  model: string
  openaiApiKey: string
  geminiApiKey: string
  ollamaBaseUrl: string
}

export interface PersistedChangelogSettings {
  defaultFeedPageSize: number
  autoPublish: boolean
}

export type { AIProviderKind }
