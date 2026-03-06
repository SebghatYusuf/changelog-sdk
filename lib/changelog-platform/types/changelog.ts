/**
 * Core TypeScript types for Changelog SDK
 */

export type ChangelogStatus = 'draft' | 'published'
export type WorkflowState = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published'
export type ChangelogTag = 'Features' | 'Fixes' | 'Improvements' | 'Breaking' | 'Security' | 'Performance' | 'Docs'

export interface ChangelogEntry {
  _id: string
  title: string
  slug: string
  content: string // Markdown
  version: string
  date: Date
  status: ChangelogStatus
  workflowState: WorkflowState
  scheduledAt?: Date
  publishedAt?: Date
  approvalNote?: string
  previewTokenVersion?: number
  tags: ChangelogTag[]
  aiGenerated: boolean
  rawNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateChangelogInput {
  title: string
  content: string
  version: string
  status: ChangelogStatus
  workflowState?: WorkflowState
  scheduledAt?: Date | string
  approvalNote?: string
  tags: ChangelogTag[]
  rawNotes?: string
  aiGenerated?: boolean
}

export interface UpdateChangelogInput {
  id: string
  title?: string
  content?: string
  version?: string
  status?: ChangelogStatus
  workflowState?: WorkflowState
  scheduledAt?: Date | string | null
  approvalNote?: string | null
  tags?: ChangelogTag[]
}

export interface EnhanceChangelogInput {
  rawNotes: string
  currentVersion?: string
}

export interface EnhanceChangelogOutput {
  title: string
  content: string // Formatted markdown with sections
  tags: ChangelogTag[]
}

export interface AIEnhancementResult {
  title: string
  content: string
  tags: ChangelogTag[]
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface FeedFilters {
  search?: string
  tags?: ChangelogTag[]
  status?: ChangelogStatus
  page?: number
  limit?: number
}

export interface FeedResponse {
  entries: ChangelogEntry[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
}

export type AIProviderKind = 'openai' | 'gemini' | 'ollama'

export interface AISettingsInput {
  provider: AIProviderKind
  model: string
  openaiApiKey?: string
  geminiApiKey?: string
  ollamaBaseUrl?: string
}

export interface AIModelOption {
  id: string
  name: string
}

export interface ChangelogSettingsInput {
  defaultFeedPageSize: number
  autoPublish: boolean
}

export interface ActionContextInput {
  basePath?: string
}

export interface TransitionWorkflowInput {
  id: string
  nextState: WorkflowState
  scheduledAt?: Date | string | null
  approvalNote?: string | null
}

export interface PreviewLinkResult {
  url: string
  token: string
  expiresAt: Date
}
