import {
  createChangelogService,
  type ChangelogRepository,
  type AISettingsRepository,
  type RepoSettingsRepository,
  type SettingsRepository,
  type AdminUserRepository,
} from '../core'
import {
  createMongooseAdminUserRepository,
  createMongooseAISettingsRepository,
  createMongooseChangelogRepository,
  createMongooseRepoSettingsRepository,
  createMongooseSettingsRepository,
} from '../mongoose'
import {
  DEFAULT_SESSION_COOKIE,
  createNextAIProviderPort,
  createNextCacheInvalidationPort,
  createNextSessionPort,
} from './ports.server'
import { createDefaultRepoProviderPort } from '../adapters/repo-provider'
import { parseEnvBoolean } from '../core/env'

export interface NextAdapterOptions {
  changelogRepository?: ChangelogRepository
  settingsRepository?: SettingsRepository
  aiSettingsRepository?: AISettingsRepository
  adminUserRepository?: AdminUserRepository
  repoSettingsRepository?: RepoSettingsRepository
  allowAdminRegistration?: boolean
  revalidatePathname?: string
  sessionCookieName?: string
}

function isRegistrationEnabledByEnv(): boolean {
  const direct = parseEnvBoolean(process.env['CHANGELOG_ALLOW_ADMIN_REGISTRATION'])
  if (direct !== undefined) return direct
  const fallback = parseEnvBoolean(
    process.env['NEXT_PUBLIC_CHANGELOG_ALLOW_ADMIN_REGISTRATION'] ||
      process.env['PUBLIC_CHANGELOG_ALLOW_ADMIN_REGISTRATION']
  )
  return fallback ?? false
}

export function createNextChangelogAdapter(options: NextAdapterOptions = {}) {
  const sessionCookieName = options.sessionCookieName || DEFAULT_SESSION_COOKIE
  const aiSettingsRepository = options.aiSettingsRepository || createMongooseAISettingsRepository()
  const adminUserRepository = options.adminUserRepository || createMongooseAdminUserRepository()
  const repoSettingsRepository = options.repoSettingsRepository || createMongooseRepoSettingsRepository()

  const service = createChangelogService({
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository,
    adminUserRepository,
    repoSettingsRepository,
    allowAdminRegistration: options.allowAdminRegistration ?? isRegistrationEnabledByEnv(),
    session: createNextSessionPort(sessionCookieName),
    cacheInvalidation: createNextCacheInvalidationPort(options.revalidatePathname || '/changelog'),
    aiProvider: createNextAIProviderPort(aiSettingsRepository),
    repoProvider: createDefaultRepoProviderPort(),
  })

  return {
    actions: {
      createChangelog: service.createEntry,
      updateChangelog: service.updateEntry,
      deleteChangelog: service.deleteEntry,
      fetchChangelogBySlug: service.getEntryBySlug,
      fetchPublishedChangelogs: service.getPublishedFeed,
      fetchAdminChangelogs: service.getAdminFeed,
      fetchAdminChangelogById: service.getAdminEntryById,
      runAIEnhance: service.enhanceWithAI,
      loginAdmin: service.loginAdmin,
      registerAdmin: service.registerAdmin,
      canRegisterAdmin: service.canRegisterAdmin,
      logoutAdmin: service.logoutAdmin,
      checkAdminAuth: service.isAdminAuthenticated,
      fetchAISettings: service.getAISettings,
      fetchAIProviderModels: service.listProviderModels,
      updateAISettings: service.updateAISettings,
      fetchLatestPublishedVersion: service.getLatestPublishedVersion,
      fetchChangelogSettings: service.getChangelogSettings,
      updateChangelogSettings: service.updateChangelogSettings,
      fetchRepoSettings: service.getRepoSettings,
      updateRepoSettings: service.updateRepoSettings,
      previewRepoCommits: service.previewRepoCommits,
      generateChangelogFromCommits: service.generateChangelogFromCommits,
    },
  }
}
