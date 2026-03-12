import bcryptjs from 'bcryptjs'
import { DEFAULT_AI_MODELS } from './constants'
import {
  AIModelListRequestSchema,
  AISettingsSchema,
  ChangelogSettingsSchema,
  CreateChangelogSchema,
  EnhanceChangelogSchema,
  LoginSchema,
  RegisterAdminSchema,
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
  AdminUserRepository,
  AISettingsRepository,
  CacheInvalidationPort,
  ChangelogRepository,
  SessionPort,
  SettingsRepository,
} from './ports'
import { compareSemver, normalizeSemver, parseSemver } from './version'

export interface ChangelogServiceDeps {
  changelogRepository: ChangelogRepository
  settingsRepository: SettingsRepository
  aiSettingsRepository: AISettingsRepository
  adminUserRepository: AdminUserRepository
  allowAdminRegistration?: boolean
  session: SessionPort
  aiProvider: AIProviderPort
  cacheInvalidation?: CacheInvalidationPort
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

  function sanitizePage(value: number, fallback = 1): number {
    return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : fallback
  }

  function sanitizeLimit(value: number, fallback: number): number {
    return Number.isFinite(value) ? Math.min(50, Math.max(1, Math.trunc(value))) : fallback
  }

  function sanitizeText(value: string | undefined, maxLength = 200): string | undefined {
    if (typeof value !== 'string') return undefined
    const normalized = value.trim()
    return normalized ? normalized.slice(0, maxLength) : undefined
  }

  function sanitizeEmail(value: string): string {
    const normalized = value.trim().toLowerCase()
    if (!normalized) {
      throw new Error('Email is required')
    }
    return normalized.slice(0, 320)
  }

  function sanitizeDisplayName(value: string | undefined, email: string): string {
    const normalized = value?.trim()
    if (normalized) return normalized.slice(0, 120)

    const localPart = email.split('@')[0]
    return localPart ? localPart.slice(0, 120) : 'Admin'
  }

  function sanitizeIdentifier(value: string, field: string): string {
    const normalized = value.trim().slice(0, 200)
    if (!normalized) {
      throw new Error(`${field} is required`)
    }
    return normalized
  }

  return {
    async createEntry(input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
      try {
        await requireAdminSession()
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
        await requireAdminSession()
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
        await requireAdminSession()
        const safeId = sanitizeIdentifier(id, 'Entry id')
        const removed = await deps.changelogRepository.remove(safeId)
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
        const safeSlug = sanitizeIdentifier(slug, 'Slug')
        const entry = await deps.changelogRepository.findBySlug(safeSlug)
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
        const safePage = sanitizePage(page, 1)
        const safeLimit = sanitizeLimit(limit, 10)
        const safeSearch = sanitizeText(search)
        const safeTags = (Array.isArray(tags) ? tags : [])
          .filter((tag): tag is ChangelogEntry['tags'][number] => typeof tag === 'string' && tag.trim().length > 0)
          .slice(0, 10)

        const data = await deps.changelogRepository.listPublished({
          page: safePage,
          limit: safeLimit,
          tags: safeTags,
          search: safeSearch,
        })
        return { success: true, data }
      } catch {
        return {
          success: true,
          data: { entries: [], total: 0, page: 1, limit: 10, hasMore: false },
        }
      }
    },

    async getAdminFeed(page = 1, limit = 20): Promise<{ success: boolean; data?: FeedResponse; error?: string }> {
      const safePage = sanitizePage(page, 1)
      const safeLimit = sanitizeLimit(limit, 20)

      try {
        await requireAdminSession()
        const data = await deps.changelogRepository.listAdmin({ page: safePage, limit: safeLimit })
        return { success: true, data }
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          return { success: false, error: 'Unauthorized' }
        }
        return {
          success: true,
          data: { entries: [], total: 0, page: safePage, limit: safeLimit, hasMore: false },
        }
      }
    },

    async getAdminEntryById(id: string): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
      try {
        await requireAdminSession()
        const safeId = sanitizeIdentifier(id, 'Entry id')
        const data = await deps.changelogRepository.findById(safeId)
        if (!data) {
          return { success: false, error: 'Changelog entry not found' }
        }
        return { success: true, data }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch changelog entry') }
      }
    },

    async loginAdmin(input: unknown): Promise<{ success: boolean; error?: string }> {
      try {
        const validated = LoginSchema.parse(input)
        const email = sanitizeEmail(validated.email)
        const adminUser = await deps.adminUserRepository.findByEmail(email)

        if (!adminUser) {
          return { success: false, error: 'Invalid email or password' }
        }

        const isValid = await bcryptjs.compare(validated.password, adminUser.passwordHash)

        if (!isValid) {
          return { success: false, error: 'Invalid email or password' }
        }

        await deps.session.setAdminSession()
        return { success: true }
      } catch {
        return { success: false, error: 'Authentication failed' }
      }
    },

    async registerAdmin(input: unknown): Promise<{ success: boolean; error?: string }> {
      try {
        const hasUsers = await deps.adminUserRepository.hasAnyUsers()
        const canRegister = Boolean(deps.allowAdminRegistration) || !hasUsers
        if (!canRegister) {
          return {
            success: false,
            error: 'Admin registration is disabled. Ask the site owner to enable CHANGELOG_ALLOW_ADMIN_REGISTRATION.',
          }
        }

        const validated = RegisterAdminSchema.parse(input)
        const email = sanitizeEmail(validated.email)
        const existing = await deps.adminUserRepository.findByEmail(email)
        if (existing) {
          return { success: false, error: 'An admin account with this email already exists' }
        }

        const passwordHash = await bcryptjs.hash(validated.password, 10)
        const displayName = sanitizeDisplayName(validated.displayName, email)
        await deps.adminUserRepository.create({ email, passwordHash, displayName })
        await deps.session.setAdminSession()
        return { success: true }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to create admin account') }
      }
    },

    async canRegisterAdmin(): Promise<{ success: boolean; data?: { canRegister: boolean }; error?: string }> {
      try {
        const hasUsers = await deps.adminUserRepository.hasAnyUsers()
        return { success: true, data: { canRegister: Boolean(deps.allowAdminRegistration) || !hasUsers } }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to check admin registration') }
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
        await requireAdminSession()
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
