import type { H3Event } from 'h3'
import { createChangelogService } from '../core'
import type {
  AdminUserRepository,
  AISettingsRepository,
  ChangelogRepository,
  SettingsRepository,
} from '../core/ports'
import {
  createMongooseAdminUserRepository,
  createMongooseAISettingsRepository,
  createMongooseChangelogRepository,
  createMongooseSettingsRepository,
} from '../mongoose'
import { createNuxtSessionPort } from './session.server'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { createDefaultAIProviderPort } from '../adapters/ai-provider'

export interface NuxtAdapterOptions {
  changelogRepository?: ChangelogRepository
  settingsRepository?: SettingsRepository
  aiSettingsRepository?: AISettingsRepository
  adminUserRepository?: AdminUserRepository
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
  
  return createChangelogService({
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository,
    adminUserRepository,
    allowAdminRegistration: options.allowAdminRegistration ?? isRegistrationEnabledByEnv(),
    session: createNuxtSessionPort(event, options.sessionCookieName || DEFAULT_SESSION_COOKIE),
    aiProvider: createDefaultAIProviderPort(aiSettingsRepository),
  })
}
