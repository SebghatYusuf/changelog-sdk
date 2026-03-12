import type { H3Event } from 'h3'
import { createChangelogService } from '../core'
import type {
  AdminUserRepository,
  AISettingsRepository,
  ChangelogRepository,
  RepoSettingsRepository,
  SettingsRepository,
} from '../core/ports'
import {
  createMongooseAdminUserRepository,
  createMongooseAISettingsRepository,
  createMongooseChangelogRepository,
  createMongooseRepoSettingsRepository,
  createMongooseSettingsRepository,
} from '../mongoose'
import { createNuxtSessionPort } from './session.server'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { createDefaultAIProviderPort } from '../adapters/ai-provider'
import { createDefaultRepoProviderPort } from '../adapters/repo-provider'

export interface NuxtAdapterOptions {
  changelogRepository?: ChangelogRepository
  settingsRepository?: SettingsRepository
  aiSettingsRepository?: AISettingsRepository
  adminUserRepository?: AdminUserRepository
  repoSettingsRepository?: RepoSettingsRepository
  allowAdminRegistration?: boolean
  sessionCookieName?: string
}

function isRegistrationEnabledByEnv(): boolean {
  const value = process.env.CHANGELOG_ALLOW_ADMIN_REGISTRATION
  if (!value) return false
  return value.trim().toLowerCase() === 'true'
}

export function createNuxtChangelogService(event: H3Event, options: NuxtAdapterOptions = {}) {
  const aiSettingsRepository = options.aiSettingsRepository || createMongooseAISettingsRepository()
  const adminUserRepository = options.adminUserRepository || createMongooseAdminUserRepository()
  const repoSettingsRepository = options.repoSettingsRepository || createMongooseRepoSettingsRepository()
  
  return createChangelogService({
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository,
    adminUserRepository,
    repoSettingsRepository,
    allowAdminRegistration: options.allowAdminRegistration ?? isRegistrationEnabledByEnv(),
    session: createNuxtSessionPort(event, options.sessionCookieName || DEFAULT_SESSION_COOKIE),
    aiProvider: createDefaultAIProviderPort(aiSettingsRepository),
    repoProvider: createDefaultRepoProviderPort(),
  })
}
