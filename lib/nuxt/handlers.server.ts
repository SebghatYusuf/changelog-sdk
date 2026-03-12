import {
  getQuery,
  getRouterParam,
  readBody,
  type EventHandler,
  type H3Event,
} from 'h3'
import { createNuxtChangelogService, type NuxtAdapterOptions } from './service.server'

export interface NuxtHandlers {
  createEntry: EventHandler
  updateEntry: EventHandler
  deleteEntry: EventHandler
  getEntryBySlug: EventHandler
  getPublishedFeed: EventHandler
  getAdminFeed: EventHandler
  getAdminEntryById: EventHandler
  login: EventHandler
  register: EventHandler
  canRegister: EventHandler
  logout: EventHandler
  enhance: EventHandler
  getAISettings: EventHandler
  updateAISettings: EventHandler
  listModels: EventHandler
  getChangelogSettings: EventHandler
  updateChangelogSettings: EventHandler
  getLatestPublishedVersion: EventHandler
  getRepoSettings: EventHandler
  updateRepoSettings: EventHandler
  previewRepoCommits: EventHandler
  generateChangelogFromCommits: EventHandler
}

function parseNumber(value: unknown, fallback: number): number {
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function parseTags(value: unknown): string[] | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  return undefined
}

export function createNuxtChangelogHandlers(options: NuxtAdapterOptions = {}): NuxtHandlers {
  const withService = (event: H3Event) => createNuxtChangelogService(event, options)

  return {
    async createEntry(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.createEntry(body)
    },

    async updateEntry(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.updateEntry(body)
    },

    async deleteEntry(event) {
      const service = withService(event)
      const id = getRouterParam(event, 'id')
      if (!id) {
        return { success: false, error: 'Changelog entry not found' }
      }
      return service.deleteEntry(id)
    },

    async getEntryBySlug(event) {
      const service = withService(event)
      const slug = getRouterParam(event, 'slug')
      if (!slug) {
        return { error: 'Changelog not found' }
      }
      return service.getEntryBySlug(slug)
    },

    async getPublishedFeed(event) {
      const service = withService(event)
      const query = getQuery(event)
      const page = parseNumber(query.page, 1)
      const limit = parseNumber(query.limit, 10)
      const tags = parseTags(query.tags)
      const search = typeof query.search === 'string' ? query.search : undefined
      return service.getPublishedFeed(page, limit, tags, search)
    },

    async getAdminFeed(event) {
      const service = withService(event)
      const query = getQuery(event)
      const page = parseNumber(query.page, 1)
      const limit = parseNumber(query.limit, 20)
      return service.getAdminFeed(page, limit)
    },

    async getAdminEntryById(event) {
      const service = withService(event)
      const id = getRouterParam(event, 'id')
      if (!id) {
        return { success: false, error: 'Changelog entry not found' }
      }
      return service.getAdminEntryById(id)
    },

    async login(event) {
      const service = withService(event)
      const body = (await readBody(event)) as { email?: string; password?: string }
      return service.loginAdmin({ email: body?.email || '', password: body?.password || '' })
    },

    async register(event) {
      const service = withService(event)
      const body = (await readBody(event)) as { email?: string; password?: string; displayName?: string }
      return service.registerAdmin({
        email: body?.email || '',
        password: body?.password || '',
        displayName: body?.displayName,
      })
    },

    async canRegister(event) {
      const service = withService(event)
      return service.canRegisterAdmin()
    },

    async logout(event) {
      const service = withService(event)
      return service.logoutAdmin()
    },

    async enhance(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.enhanceWithAI(body)
    },

    async getAISettings(event) {
      const service = withService(event)
      return service.getAISettings()
    },

    async updateAISettings(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.updateAISettings(body)
    },

    async listModels(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.listProviderModels(body)
    },

    async getChangelogSettings(event) {
      const service = withService(event)
      return service.getChangelogSettings()
    },

    async updateChangelogSettings(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.updateChangelogSettings(body)
    },

    async getLatestPublishedVersion(event) {
      const service = withService(event)
      return service.getLatestPublishedVersion()
    },

    async getRepoSettings(event) {
      const service = withService(event)
      return service.getRepoSettings()
    },

    async updateRepoSettings(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.updateRepoSettings(body)
    },

    async previewRepoCommits(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.previewRepoCommits(body)
    },

    async generateChangelogFromCommits(event) {
      const service = withService(event)
      const body = await readBody(event)
      return service.generateChangelogFromCommits(body)
    },
  }
}
