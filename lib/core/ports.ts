import type {
  AdminUser,
  AIModelOption,
  ChangelogEntry,
  ChangelogSettingsInput,
  ChangelogTag,
  CreateChangelogInput,
  EnhanceChangelogOutput,
  FeedResponse,
  LoginInput,
  PersistedAISettings,
  PersistedChangelogSettings,
  RegisterAdminInput,
  RepoCommit,
  RepoCommitQuery,
  RepoSettingsInput,
  PersistedRepoSettings,
  UpdateChangelogInput,
} from './types'
import type { AIProviderKind } from './constants'

export interface ChangelogRepository {
  create(input: Omit<CreateChangelogInput, 'version'> & { version: string }): Promise<ChangelogEntry>
  update(id: string, patch: Omit<UpdateChangelogInput, 'id'>): Promise<ChangelogEntry | null>
  remove(id: string): Promise<boolean>
  findBySlug(slug: string): Promise<ChangelogEntry | null>
  findById(id: string): Promise<ChangelogEntry | null>
  listPublished(input: { page: number; limit: number; tags?: ChangelogTag[]; search?: string }): Promise<FeedResponse>
  listAdmin(input: { page: number; limit: number }): Promise<FeedResponse>
  listVersions(excludeId?: string): Promise<string[]>
  listPublishedVersions(): Promise<string[]>
}

export interface SettingsRepository {
  get(): Promise<PersistedChangelogSettings>
  save(input: ChangelogSettingsInput): Promise<PersistedChangelogSettings>
}

export interface AISettingsRepository {
  get(): Promise<PersistedAISettings>
  save(input: PersistedAISettings): Promise<PersistedAISettings>
}

export interface AdminUserRepository {
  create(input: { email: string; passwordHash: string; displayName: string }): Promise<AdminUser>
  findByEmail(email: string): Promise<AdminUser | null>
  hasAnyUsers(): Promise<boolean>
}

export interface RepoSettingsRepository {
  get(): Promise<PersistedRepoSettings>
  save(input: RepoSettingsInput): Promise<PersistedRepoSettings>
}

export interface SessionPort {
  setAdminSession(): Promise<void>
  clearAdminSession(): Promise<void>
  hasAdminSession(): Promise<boolean>
}

export interface CacheInvalidationPort {
  revalidateChangelog(): void | Promise<void>
}

export interface AIProviderPort {
  enhance(rawNotes: string, currentVersion?: string): Promise<EnhanceChangelogOutput>
  listModels(input: { provider: AIProviderKind; ollamaBaseUrl?: string }): Promise<AIModelOption[]>
}

export interface RepoProviderPort {
  listCommits(input: {
    settings: PersistedRepoSettings
    query: RepoCommitQuery
  }): Promise<RepoCommit[]>
}

export type LoginAdminPayload = LoginInput
export type RegisterAdminPayload = RegisterAdminInput
