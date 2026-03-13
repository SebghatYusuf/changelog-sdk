import type { ChangelogApiClient } from './types'
import { createHttpClient, type HttpOptions } from './http'

export function createRestChangelogApi(options: HttpOptions = {}): ChangelogApiClient {
  const { request } = createHttpClient(options)

  return {
    getFeed(params = {}) {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.tags && params.tags.length > 0) query.set('tags', params.tags.join(','))
      if (params.search) query.set('search', params.search)
      return request(`/feed?${query.toString()}`)
    },

    getEntryBySlug(slug) {
      return request(`/entries/${encodeURIComponent(slug)}`)
    },

    getAdminFeed(params = {}) {
      const query = new URLSearchParams()
      if (params.page) query.set('page', String(params.page))
      if (params.limit) query.set('limit', String(params.limit))
      return request(`/admin/entries?${query.toString()}`)
    },

    getAdminEntryById(id) {
      return request(`/admin/entries/${encodeURIComponent(id)}`)
    },

    createEntry(input) {
      return request(`/admin/entries`, { method: 'POST', body: JSON.stringify(input) })
    },

    updateEntry(id, input) {
      return request(`/admin/entries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteEntry(id) {
      return request(`/admin/entries/${encodeURIComponent(id)}`, { method: 'DELETE' })
    },

    login(input) {
      return request(`/admin/login`, { method: 'POST', body: JSON.stringify(input) })
    },

    register(input) {
      return request(`/admin/register`, { method: 'POST', body: JSON.stringify(input) })
    },

    canRegister() {
      return request(`/admin/can-register`)
    },

    logout() {
      return request(`/admin/logout`, { method: 'POST' })
    },

    async checkAdminAuth() {
      const result = await request<{ success: boolean; error?: string }>(`/admin/entries?page=1&limit=1`)
      return Boolean(result.success && !result.error)
    },

    enhance(input) {
      return request(`/admin/enhance`, { method: 'POST', body: JSON.stringify(input) })
    },

    getAISettings() {
      return request(`/admin/ai-settings`)
    },

    updateAISettings(input) {
      return request(`/admin/ai-settings`, { method: 'POST', body: JSON.stringify(input) })
    },

    listModels(input) {
      return request(`/admin/ai-models`, { method: 'POST', body: JSON.stringify(input) })
    },

    getChangelogSettings() {
      return request(`/admin/changelog-settings`)
    },

    updateChangelogSettings(input) {
      return request(`/admin/changelog-settings`, { method: 'POST', body: JSON.stringify(input) })
    },

    getLatestPublishedVersion() {
      return request(`/admin/latest-version`)
    },

    getRepoSettings() {
      return request(`/admin/repo-settings`)
    },

    updateRepoSettings(input) {
      return request(`/admin/repo-settings`, { method: 'POST', body: JSON.stringify(input) })
    },

    previewRepoCommits(input) {
      return request(`/admin/repo-commits`, { method: 'POST', body: JSON.stringify(input) })
    },

    generateChangelogFromCommits(input) {
      return request(`/admin/repo-generate`, { method: 'POST', body: JSON.stringify(input) })
    },
  }
}
