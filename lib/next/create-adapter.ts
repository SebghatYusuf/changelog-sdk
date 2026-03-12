import {
  createChangelogService,
  type ChangelogRepository,
  type AISettingsRepository,
  type SettingsRepository,
  type AdminUserRepository,
} from '../core'
import {
  createMongooseAdminUserRepository,
  createMongooseAISettingsRepository,
  createMongooseChangelogRepository,
  createMongooseSettingsRepository,
} from '../mongoose'
import {
  DEFAULT_SESSION_COOKIE,
  createNextAIProviderPort,
  createNextCacheInvalidationPort,
  createNextSessionPort,
} from './ports.server'

export interface NextAdapterOptions {
  changelogRepository?: ChangelogRepository
  settingsRepository?: SettingsRepository
  aiSettingsRepository?: AISettingsRepository
  adminUserRepository?: AdminUserRepository
  allowAdminRegistration?: boolean
  revalidatePathname?: string
  sessionCookieName?: string
}

function isRegistrationEnabledByEnv(): boolean {
  const value = process.env.CHANGELOG_ALLOW_ADMIN_REGISTRATION
  if (!value) return false
  return value.trim().toLowerCase() === 'true'
}

export function createNextChangelogAdapter(options: NextAdapterOptions = {}) {
  const sessionCookieName = options.sessionCookieName || DEFAULT_SESSION_COOKIE
  const aiSettingsRepository = options.aiSettingsRepository || createMongooseAISettingsRepository()
  const adminUserRepository = options.adminUserRepository || createMongooseAdminUserRepository()

  const service = createChangelogService({
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository,
    adminUserRepository,
    allowAdminRegistration: options.allowAdminRegistration ?? isRegistrationEnabledByEnv(),
    session: createNextSessionPort(sessionCookieName),
    cacheInvalidation: createNextCacheInvalidationPort(options.revalidatePathname || '/changelog'),
    aiProvider: createNextAIProviderPort(aiSettingsRepository),
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
    },
  }
}
