import type {
  AIModelOption,
  AIProviderKind,
  ChangelogEntry,
  ChangelogSettingsInput,
  EnhanceChangelogOutput,
  FeedResponse,
} from './types'
import { createHttpClient, type HttpOptions } from './utils/http'

export function createChangelogApi(options: HttpOptions = {}) {
  const { request } = createHttpClient(options)

  return {
    getFeed(params: { page?: number; limit?: number; tags?: string[]; search?: string } = {}) {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.tags && params.tags.length > 0) query.set('tags', params.tags.join(','))
      if (params.search) query.set('search', params.search)
      return request<{ success: boolean; data: FeedResponse }>(`/feed?${query.toString()}`)
    },

    getEntryBySlug(slug: string) {
      return request<{ data?: ChangelogEntry; error?: string }>(`/entries/${encodeURIComponent(slug)}`)
    },

    getAdminFeed(params: { page?: number; limit?: number } = {}) {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      return request<{ success: boolean; data?: FeedResponse; error?: string }>(`/admin/entries?${query.toString()}`)
    },

    getAdminEntryById(id: string) {
      return request<{ success: boolean; data?: ChangelogEntry; error?: string }>(`/admin/entries/${encodeURIComponent(id)}`)
    },

    createEntry(input: unknown) {
      return request<{ success: boolean; data?: ChangelogEntry; error?: string }>(`/admin/entries`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateEntry(id: string, input: unknown) {
      return request<{ success: boolean; data?: ChangelogEntry; error?: string }>(`/admin/entries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteEntry(id: string) {
      return request<{ success: boolean; error?: string }>(`/admin/entries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
    },

    login(password: string) {
      return request<{ success: boolean; error?: string }>(`/admin/login`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
    },

    logout() {
      return request<{ success: boolean }>(`/admin/logout`, { method: 'POST' })
    },

    enhance(input: unknown) {
      return request<{ success: boolean; data?: EnhanceChangelogOutput; error?: string }>(`/admin/enhance`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    getAISettings() {
      return request<{ success: boolean; data?: { provider: AIProviderKind; model: string; ollamaBaseUrl?: string }; error?: string }>(`/admin/ai-settings`)
    },

    updateAISettings(input: unknown) {
      return request<{ success: boolean; data?: unknown; error?: string }>(`/admin/ai-settings`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    listModels(input: { provider: AIProviderKind; ollamaBaseUrl?: string }) {
      return request<{ success: boolean; data?: AIModelOption[]; error?: string }>(`/admin/ai-models`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    getChangelogSettings() {
      return request<{ success: boolean; data?: { defaultFeedPageSize: number; autoPublish: boolean }; error?: string }>(`/admin/changelog-settings`)
    },

    updateChangelogSettings(input: ChangelogSettingsInput) {
      return request<{ success: boolean; data?: unknown; error?: string }>(`/admin/changelog-settings`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    getLatestPublishedVersion() {
      return request<{ success: boolean; data?: { version: string }; error?: string }>(`/admin/latest-version`)
    },
  }
}
