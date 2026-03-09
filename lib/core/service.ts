import bcryptjs from 'bcryptjs'
import { DEFAULT_AI_MODELS } from './constants'
import {
  AIModelListRequestSchema,
  AISettingsSchema,
  ChangelogSettingsSchema,
  CreateChangelogSchema,
  EnhanceChangelogSchema,
  LoginSchema,
  UpdateChangelogSchema,
} from './schemas'
import type {
  AIModelOption,
  ChangelogEntry,
  ChangelogSettingsInput,
  EnhanceChangelogOutput,
  FeedResponse,
  PersistedAISettings,
} from './types'
import type {
  AIProviderPort,
  AISettingsRepository,
  CacheInvalidationPort,
  ChangelogRepository,
  CoreConfig,
  SessionPort,
  SettingsRepository,
} from './ports'
import { compareSemver, normalizeSemver, parseSemver } from './version'

export interface ChangelogServiceDeps {
  changelogRepository: ChangelogRepository
  settingsRepository: SettingsRepository
  aiSettingsRepository: AISettingsRepository
  session: SessionPort
  aiProvider: AIProviderPort
  cacheInvalidation?: CacheInvalidationPort
  config: CoreConfig
}

export function createChangelogService(deps: ChangelogServiceDeps) {
  async function assertVersionNotLower(candidateVersion: string, excludeId?: string): Promise<void> {
    if (!parseSemver(candidateVersion)) {
      throw new Error('Version must use semantic format (e.g. 1.2.3)')
    }

    const versions = await deps.changelogRepository.listVersions(excludeId)

    let highest: string | null = null
    for (const version of versions) {
      const normalized = normalizeSemver(version)
      if (!parseSemver(normalized)) continue
      if (!highest || compareSemver(normalized, highest) > 0) {
        highest = normalized
      }
    }

    if (!highest) return
    if (compareSemver(candidateVersion, highest) <= 0) {
      throw new Error("This version is already deployed and can't be added again. If you need changes, edit the existing changelog entry.")
    }
  }

  async function requireAdminSession(): Promise<void> {
    const hasSession = await deps.session.hasAdminSession()
    if (!hasSession) {
      throw new Error('Unauthorized')
    }
  }

  function wrapError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback
  }

  return {
    async createEntry(input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
      try {
        const validated = CreateChangelogSchema.parse(input)
        const normalizedVersion = normalizeSemver(validated.version)
        await assertVersionNotLower(normalizedVersion)

        const settings = await deps.settingsRepository.get()
        const created = await deps.changelogRepository.create({
          ...validated,
          version: normalizedVersion,
          status: settings.autoPublish ? 'published' : validated.status,
        })

        await deps.cacheInvalidation?.revalidateChangelog()
        return { success: true, data: created }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to create changelog') }
      }
    },

    async updateEntry(input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
      try {
        const validated = UpdateChangelogSchema.parse(input)
        const normalizedVersion = validated.version ? normalizeSemver(validated.version) : undefined

        if (normalizedVersion) {
          const existing = await deps.changelogRepository.findById(validated.id)
          if (!existing) {
            return { success: false, error: 'Changelog entry not found' }
          }

          if (normalizeSemver(existing.version) !== normalizedVersion) {
            await assertVersionNotLower(normalizedVersion, validated.id)
          }
        }

        const updated = await deps.changelogRepository.update(validated.id, {
          title: validated.title,
          content: validated.content,
          version: normalizedVersion,
          status: validated.status,
          tags: validated.tags,
        })

        if (!updated) {
          return { success: false, error: 'Changelog entry not found' }
        }

        await deps.cacheInvalidation?.revalidateChangelog()
        return { success: true, data: updated }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to update changelog') }
      }
    },

    async deleteEntry(id: string): Promise<{ success: boolean; error?: string }> {
      try {
        const removed = await deps.changelogRepository.remove(id)
        if (!removed) {
          return { success: false, error: 'Changelog entry not found' }
        }

        await deps.cacheInvalidation?.revalidateChangelog()
        return { success: true }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to delete changelog') }
      }
    },

    async getEntryBySlug(slug: string): Promise<{ data?: ChangelogEntry; error?: string }> {
      try {
        const entry = await deps.changelogRepository.findBySlug(slug)
        if (!entry) {
          return { error: 'Changelog not found' }
        }
        return { data: entry }
      } catch (error) {
        return { error: wrapError(error, 'Failed to fetch changelog') }
      }
    },

    async getPublishedFeed(page = 1, limit = 10, tags?: string[], search?: string): Promise<{ success: boolean; data: FeedResponse }> {
      try {
        const data = await deps.changelogRepository.listPublished({
          page,
          limit,
          tags: (tags || []) as ChangelogEntry['tags'],
          search,
        })
        return { success: true, data }
      } catch {
        return {
          success: true,
          data: { entries: [], total: 0, page, limit, hasMore: false },
        }
      }
    },

    async getAdminFeed(page = 1, limit = 20): Promise<{ success: boolean; data?: FeedResponse; error?: string }> {
      try {
        await requireAdminSession()
        const data = await deps.changelogRepository.listAdmin({ page, limit })
        return { success: true, data }
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          return { success: false, error: 'Unauthorized' }
        }
        return {
          success: true,
          data: { entries: [], total: 0, page, limit, hasMore: false },
        }
      }
    },

    async getAdminEntryById(id: string): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
      try {
        await requireAdminSession()
        const data = await deps.changelogRepository.findById(id)
        if (!data) {
          return { success: false, error: 'Changelog entry not found' }
        }
        return { success: true, data }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch changelog entry') }
      }
    },

    async loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
      try {
        const validated = LoginSchema.parse({ password })
        const adminPassword = deps.config.getAdminPassword()?.trim()

        if (!adminPassword) {
          return {
            success: false,
            error: 'Admin password not configured. If using a bcrypt hash in .env.local, escape "$" as "\\$".',
          }
        }

        const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(adminPassword)
        const isValid = isBcryptHash ? await bcryptjs.compare(validated.password, adminPassword) : validated.password === adminPassword

        if (!isValid) {
          return { success: false, error: 'Invalid password' }
        }

        await deps.session.setAdminSession()
        return { success: true }
      } catch {
        return { success: false, error: 'Authentication failed' }
      }
    },

    async logoutAdmin(): Promise<{ success: boolean }> {
      try {
        await deps.session.clearAdminSession()
        return { success: true }
      } catch {
        return { success: false }
      }
    },

    async isAdminAuthenticated(): Promise<boolean> {
      try {
        return await deps.session.hasAdminSession()
      } catch {
        return false
      }
    },

    async enhanceWithAI(input: unknown): Promise<{ success: boolean; data?: EnhanceChangelogOutput; error?: string }> {
      try {
        const validated = EnhanceChangelogSchema.parse(input)
        const result = await deps.aiProvider.enhance(validated.rawNotes, validated.currentVersion)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to enhance changelog') }
      }
    },

    async getAISettings(): Promise<{ success: boolean; data?: PersistedAISettings; error?: string }> {
      try {
        await requireAdminSession()
        const data = await deps.aiSettingsRepository.get()
        return { success: true, data }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch AI settings') }
      }
    },

    async updateAISettings(input: unknown): Promise<{ success: boolean; data?: PersistedAISettings; error?: string }> {
      try {
        await requireAdminSession()
        const validated = AISettingsSchema.parse(input)
        const saved = await deps.aiSettingsRepository.save({
          provider: validated.provider,
          model: validated.model || DEFAULT_AI_MODELS[validated.provider],
          openaiApiKey: '',
          geminiApiKey: '',
          ollamaBaseUrl: validated.ollamaBaseUrl || '',
        })
        return { success: true, data: saved }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to update AI settings') }
      }
    },

    async listProviderModels(input: unknown): Promise<{ success: boolean; data?: AIModelOption[]; error?: string }> {
      try {
        await requireAdminSession()
        const validated = AIModelListRequestSchema.parse(input)
        const models = await deps.aiProvider.listModels({
          provider: validated.provider,
          ollamaBaseUrl: validated.ollamaBaseUrl,
        })

        if (models.length === 0) {
          return {
            success: true,
            data: [{ id: DEFAULT_AI_MODELS[validated.provider], name: DEFAULT_AI_MODELS[validated.provider] }],
          }
        }

        return { success: true, data: models }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch models') }
      }
    },

    async getChangelogSettings() {
      try {
        await requireAdminSession()
        const data = await deps.settingsRepository.get()
        return { success: true, data }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch changelog settings') }
      }
    },

    async updateChangelogSettings(input: unknown) {
      try {
        await requireAdminSession()
        const validated = ChangelogSettingsSchema.parse(input)
        const normalized: ChangelogSettingsInput = {
          defaultFeedPageSize: validated.defaultFeedPageSize,
          autoPublish: validated.autoPublish,
        }
        const data = await deps.settingsRepository.save(normalized)
        return { success: true, data }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to update changelog settings') }
      }
    },

    async getLatestPublishedVersion(): Promise<{ success: boolean; data?: { version: string }; error?: string }> {
      try {
        await requireAdminSession()
        const versions = await deps.changelogRepository.listPublishedVersions()
        let highest = '1.0.0'

        for (const version of versions) {
          const normalized = normalizeSemver(version)
          if (!parseSemver(normalized)) continue
          if (compareSemver(normalized, highest) > 0) {
            highest = normalized
          }
        }

        return { success: true, data: { version: highest } }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch latest published version') }
      }
    },
  }
}

export type ChangelogService = ReturnType<typeof createChangelogService>
