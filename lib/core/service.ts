import bcryptjs from 'bcryptjs'
import { DEFAULT_AI_MODELS } from './constants'
import {
  AIModelListRequestSchema,
  AISettingsSchema,
  ChangelogSettingsSchema,
  CreateChangelogSchema,
  EnhanceChangelogSchema,
  LoginSchema,
  RepoCommitQuerySchema,
  RepoSettingsSchema,
  RegisterAdminSchema,
  UpdateChangelogSchema,
} from './schemas'
import type {
  AIModelOption,
  ChangelogEntry,
  ChangelogSettingsInput,
  EnhanceChangelogOutput,
  FeedResponse,
  GenerateChangelogFromCommitsOutput,
  PersistedAISettings,
  PersistedRepoSettings,
  RepoCommit,
  RepoCommitQuery,
  RepoSettingsInput,
  RepoSettingsView,
} from './types'
import type {
  AIProviderPort,
  AdminUserRepository,
  AISettingsRepository,
  CacheInvalidationPort,
  ChangelogRepository,
  RepoProviderPort,
  RepoSettingsRepository,
  SessionPort,
  SettingsRepository,
} from './ports'
import { compareSemver, normalizeSemver, parseSemver } from './version'
import { hasEncryptionKey } from './crypto'
import net from 'node:net'

export interface ChangelogServiceDeps {
  changelogRepository: ChangelogRepository
  settingsRepository: SettingsRepository
  aiSettingsRepository: AISettingsRepository
  adminUserRepository: AdminUserRepository
  repoSettingsRepository?: RepoSettingsRepository
  repoProvider?: RepoProviderPort
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

  function sanitizeRepoField(value: string | undefined, field: string, maxLength = 200): string | undefined {
    if (typeof value !== 'string') return undefined
    const normalized = value.trim()
    if (!normalized) return undefined
    if (normalized.length > maxLength) {
      throw new Error(`${field} must be less than ${maxLength} characters`)
    }
    return normalized
  }

  function isPrivateIpAddress(ip: string): boolean {
    if (net.isIP(ip) === 4) {
      const [a, b] = ip.split('.').map((segment) => Number(segment))
      if (a === 10) return true
      if (a === 127) return true
      if (a === 169 && b === 254) return true
      if (a === 172 && b >= 16 && b <= 31) return true
      if (a === 192 && b === 168) return true
      if (a === 0) return true
      return false
    }

    if (net.isIP(ip) === 6) {
      const normalized = ip.toLowerCase()
      if (normalized === '::1') return true
      if (normalized.startsWith('fe80:')) return true
      if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true
    }

    return false
  }

  function assertSafeRepoUrl(value: string): string {
    let url: URL
    try {
      url = new URL(value)
    } catch {
      throw new Error('Repository URL must be a valid https URL')
    }

    if (url.protocol !== 'https:') {
      throw new Error('Repository URL must use https')
    }

    if (url.username || url.password) {
      throw new Error('Repository URL must not include credentials')
    }

    const hostname = url.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.localdomain') || hostname.endsWith('.internal')) {
      throw new Error('Repository host is not allowed')
    }

    if (net.isIP(hostname) && isPrivateIpAddress(hostname)) {
      throw new Error('Repository host is not allowed')
    }

    return url.toString()
  }

  function parseCommitDate(input: string | undefined): Date | undefined {
    if (!input) return undefined
    const trimmed = input.trim()
    if (!trimmed) return undefined

    const isoCandidate = trimmed.length <= 10 ? `${trimmed}T00:00:00.000Z` : trimmed
    const parsed = new Date(isoCandidate)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  function formatCommitDate(date: Date): string {
    return date.toISOString().slice(0, 10)
  }

  function parseDateRange(input: { since?: string; until?: string }): { since?: Date; until?: Date } {
    const parseLocalDate = (value: string, endOfDay: boolean) => {
      const [year, month, day] = value.split('-').map((part) => Number(part))
      if (!year || !month || !day) return undefined
      if (endOfDay) {
        return new Date(year, month - 1, day, 23, 59, 59, 999)
      }
      return new Date(year, month - 1, day, 0, 0, 0, 0)
    }

    let since: Date | undefined
    let until: Date | undefined

    if (input.since) {
      since = input.since.trim().length <= 10 ? parseLocalDate(input.since.trim(), false) : parseCommitDate(input.since)
    }

    if (input.until) {
      until = input.until.trim().length <= 10 ? parseLocalDate(input.until.trim(), true) : parseCommitDate(input.until)
    }

    if (since && Number.isNaN(since.getTime())) since = undefined
    if (until && Number.isNaN(until.getTime())) until = undefined

    return { since, until }
  }

  function toRepoSettingsView(settings: PersistedRepoSettings): RepoSettingsView {
    return {
      provider: settings.provider,
      repoUrl: settings.repoUrl || undefined,
      workspace: settings.workspace || undefined,
      repoSlug: settings.repoSlug || undefined,
      branch: settings.branch || undefined,
      enabled: settings.enabled,
      hasToken: Boolean(settings.token),
    }
  }

  function summarizeCommit(message: string): string {
    const summary = message.split('\n')[0]?.trim() || ''
    return summary.slice(0, 160)
  }

  function classifyCommit(message: string): { tag: ChangelogEntry['tags'][number]; summary: string } {
    const summary = summarizeCommit(message)
    const lower = summary.toLowerCase()

    if (lower.includes('security')) {
      return { tag: 'Security', summary }
    }

    if (/breaking[\s:-]/i.test(summary) || /!:/i.test(summary)) {
      return { tag: 'Breaking', summary }
    }

    if (lower.startsWith('feat') || lower.startsWith('feature')) {
      return { tag: 'Features', summary }
    }

    if (lower.startsWith('fix') || lower.startsWith('bug')) {
      return { tag: 'Fixes', summary }
    }

    if (lower.startsWith('perf')) {
      return { tag: 'Performance', summary }
    }

    if (lower.startsWith('docs') || lower.startsWith('doc')) {
      return { tag: 'Docs', summary }
    }

    return { tag: 'Improvements', summary }
  }

  function ensureRepoDeps(context: ChangelogServiceDeps): asserts context is ChangelogServiceDeps & {
    repoSettingsRepository: RepoSettingsRepository
    repoProvider: RepoProviderPort
  } {
    if (!context.repoSettingsRepository || !context.repoProvider) {
      throw new Error('Repository integration is not configured')
    }
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

    async getRepoSettings(): Promise<{ success: boolean; data?: RepoSettingsView; error?: string }> {
      try {
        await requireAdminSession()
        ensureRepoDeps(deps)
        const settings = await deps.repoSettingsRepository.get()
        return { success: true, data: toRepoSettingsView(settings) }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to fetch repository settings') }
      }
    },

    async updateRepoSettings(input: unknown): Promise<{ success: boolean; data?: RepoSettingsView; error?: string }> {
      try {
        await requireAdminSession()
        ensureRepoDeps(deps)
        const validated = RepoSettingsSchema.parse(input)
        const provider = validated.provider
        const branch = sanitizeRepoField(validated.branch, 'Branch', 100) || 'main'
        const enabled = typeof validated.enabled === 'boolean' ? validated.enabled : true

        const repoUrlValue = sanitizeRepoField(validated.repoUrl, 'Repository URL', 500)
        const repoUrl = provider === 'git' ? (repoUrlValue ? assertSafeRepoUrl(repoUrlValue) : '') : ''
        const workspace =
          provider === 'bitbucket'
            ? sanitizeRepoField(validated.workspace, 'Workspace', 120) || ''
            : ''
        const repoSlug =
          provider === 'bitbucket'
            ? sanitizeRepoField(validated.repoSlug, 'Repository', 120) || ''
            : ''

        if (provider === 'git' && !repoUrl) {
          throw new Error('Repository URL is required')
        }

        if (provider === 'bitbucket' && (!workspace || !repoSlug)) {
          throw new Error('Workspace and repository slug are required')
        }

        const tokenCandidate = validated.clearToken ? '' : sanitizeRepoField(validated.token, 'Token', 400)
        if (tokenCandidate && !hasEncryptionKey()) {
          throw new Error('CHANGELOG_ENCRYPTION_KEY must be set to store repository tokens')
        }

        const payload: RepoSettingsInput = {
          provider,
          repoUrl,
          workspace,
          repoSlug,
          branch,
          enabled,
          ...(typeof tokenCandidate === 'string' ? { token: tokenCandidate } : {}),
          ...(validated.clearToken ? { clearToken: true } : {}),
        }

        const saved = await deps.repoSettingsRepository.save(payload)
        return { success: true, data: toRepoSettingsView(saved) }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to update repository settings') }
      }
    },

    async previewRepoCommits(input: unknown): Promise<{ success: boolean; data?: RepoCommit[]; error?: string }> {
      try {
        await requireAdminSession()
        ensureRepoDeps(deps)
        const validated = RepoCommitQuerySchema.parse(input)
        const { since: sinceDate, until: untilDate } = parseDateRange({
          since: validated.since,
          until: validated.until,
        })
        const limit = Math.min(200, Math.max(1, validated.limit ?? 50))
        const query: RepoCommitQuery = {
          since: sinceDate ? sinceDate.toISOString() : undefined,
          until: untilDate ? untilDate.toISOString() : undefined,
          limit,
          includeMerges: validated.includeMerges,
        }

        const settings = await deps.repoSettingsRepository.get()
        if (!settings.enabled) {
          return { success: false, error: 'Repository integration is disabled' }
        }

        const commits = await deps.repoProvider.listCommits({ settings, query })
        return { success: true, data: commits }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to load commits') }
      }
    },

    async generateChangelogFromCommits(
      input: unknown
    ): Promise<{ success: boolean; data?: GenerateChangelogFromCommitsOutput; error?: string }> {
      try {
        await requireAdminSession()
        ensureRepoDeps(deps)
        const validated = RepoCommitQuerySchema.parse(input)
        const { since: sinceDate, until: untilDate } = parseDateRange({
          since: validated.since,
          until: validated.until,
        })
        const limit = Math.min(200, Math.max(1, validated.limit ?? 50))
        const query: RepoCommitQuery = {
          since: sinceDate ? sinceDate.toISOString() : undefined,
          until: untilDate ? untilDate.toISOString() : undefined,
          limit,
          includeMerges: validated.includeMerges,
        }

        const settings = await deps.repoSettingsRepository.get()
        if (!settings.enabled) {
          return { success: false, error: 'Repository integration is disabled' }
        }

        const commits = await deps.repoProvider.listCommits({ settings, query })
        if (!commits.length) {
          return { success: false, error: 'No commits found for the selected range' }
        }

        const grouped = new Map<ChangelogEntry['tags'][number], string[]>()
        for (const commit of commits) {
          const { tag, summary } = classifyCommit(commit.message)
          const bucket = grouped.get(tag) || []
          bucket.push(summary)
          grouped.set(tag, bucket)
        }

        const orderedTags: ChangelogEntry['tags'][number][] = [
          'Breaking',
          'Security',
          'Features',
          'Improvements',
          'Fixes',
          'Performance',
          'Docs',
        ]

        const sections: string[] = []
        for (const tag of orderedTags) {
          const items = grouped.get(tag)
          if (!items || items.length === 0) continue
          const lines = items.map((item) => `- ${item}`)
          sections.push(`## ${tag}\n${lines.join('\n')}`)
        }

        let title = 'Release notes'
        if (sinceDate || untilDate) {
          const sinceLabel = sinceDate ? formatCommitDate(sinceDate) : '...'
          const untilLabel = untilDate ? formatCommitDate(untilDate) : 'today'
          title = `Release notes (${sinceLabel} → ${untilLabel})`
        } else {
          title = `Release notes (${commits.length} commits)`
        }

        return {
          success: true,
          data: {
            title,
            content: sections.join('\n\n'),
            tags: orderedTags.filter((tag) => grouped.has(tag)),
            commits: commits.slice(0, limit),
          },
        }
      } catch (error) {
        return { success: false, error: wrapError(error, 'Failed to generate changelog from commits') }
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
