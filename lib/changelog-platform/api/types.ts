import type {
  AIModelOption,
  AIProviderKind,
  ChangelogEntry,
  ChangelogSettingsInput,
  EnhanceChangelogOutput,
  FeedResponse,
  RepoCommit,
  RepoSettingsView,
  GenerateChangelogFromCommitsOutput,
} from '../types/changelog'

export interface ChangelogApiClient {
  getFeed(params?: { page?: number; limit?: number; tags?: string[]; search?: string }): Promise<{ success: boolean; data: FeedResponse }>
  getEntryBySlug(slug: string): Promise<{ data?: ChangelogEntry; error?: string }>

  getAdminFeed(params?: { page?: number; limit?: number }): Promise<{ success: boolean; data?: FeedResponse; error?: string }>
  getAdminEntryById(id: string): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }>
  createEntry(input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }>
  updateEntry(id: string, input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }>
  deleteEntry(id: string): Promise<{ success: boolean; error?: string }>

  login(input: { email: string; password: string }): Promise<{ success: boolean; error?: string }>
  register(input: { email: string; password: string; displayName?: string }): Promise<{ success: boolean; error?: string }>
  canRegister(): Promise<{ success: boolean; data?: { canRegister: boolean }; error?: string }>
  logout(): Promise<{ success: boolean }>
  checkAdminAuth(): Promise<boolean>

  enhance(input: unknown): Promise<{ success: boolean; data?: EnhanceChangelogOutput; error?: string }>

  getAISettings(): Promise<{ success: boolean; data?: { provider: AIProviderKind; model: string; ollamaBaseUrl?: string }; error?: string }>
  updateAISettings(input: unknown): Promise<{ success: boolean; data?: unknown; error?: string }>
  listModels(input: { provider: AIProviderKind; ollamaBaseUrl?: string }): Promise<{ success: boolean; data?: AIModelOption[]; error?: string }>

  getChangelogSettings(): Promise<{ success: boolean; data?: { defaultFeedPageSize: number; autoPublish: boolean }; error?: string }>
  updateChangelogSettings(input: ChangelogSettingsInput): Promise<{ success: boolean; data?: { defaultFeedPageSize: number; autoPublish: boolean }; error?: string }>
  getLatestPublishedVersion(): Promise<{ success: boolean; data?: { version: string }; error?: string }>

  getRepoSettings(): Promise<{ success: boolean; data?: RepoSettingsView; error?: string }>
  updateRepoSettings(input: unknown): Promise<{ success: boolean; data?: RepoSettingsView; error?: string }>
  previewRepoCommits(input: unknown): Promise<{ success: boolean; data?: RepoCommit[]; error?: string }>
  generateChangelogFromCommits(input: unknown): Promise<{ success: boolean; data?: GenerateChangelogFromCommitsOutput; error?: string }>
}
