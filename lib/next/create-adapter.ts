import { createChangelogService, type ChangelogRepository, type AISettingsRepository, type SettingsRepository } from '../core'
import {
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
  revalidatePathname?: string
  sessionCookieName?: string
}

export function createNextChangelogAdapter(options: NextAdapterOptions = {}) {
  const sessionCookieName = options.sessionCookieName || DEFAULT_SESSION_COOKIE

  const service = createChangelogService({
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository: options.aiSettingsRepository || createMongooseAISettingsRepository(),
    session: createNextSessionPort(sessionCookieName),
    cacheInvalidation: createNextCacheInvalidationPort(options.revalidatePathname || '/changelog'),
    aiProvider: createNextAIProviderPort(),
    config: {
      getAdminPassword: () => process.env.CHANGELOG_ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSWORD?.trim(),
    },
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
