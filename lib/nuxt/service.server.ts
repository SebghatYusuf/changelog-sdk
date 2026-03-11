import type { H3Event } from 'h3'
import { createChangelogService } from '../core'
import type {
  AISettingsRepository,
  ChangelogRepository,
  SettingsRepository,
} from '../core/ports'
import {
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
  sessionCookieName?: string
}

export function createNuxtChangelogService(event: H3Event, options: NuxtAdapterOptions = {}) {
  const aiSettingsRepository = options.aiSettingsRepository || createMongooseAISettingsRepository()
  
  return createChangelogService({
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository,
    session: createNuxtSessionPort(event, options.sessionCookieName || DEFAULT_SESSION_COOKIE),
    aiProvider: createDefaultAIProviderPort(aiSettingsRepository),
    config: {
      getAdminPassword: () => process.env.CHANGELOG_ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSWORD?.trim(),
    },
  })
}
