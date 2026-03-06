import { z } from 'zod'

/**
 * Zod validation schemas for Changelog SDK
 */

export const ChangelogTagEnum = z.enum(['Features', 'Fixes', 'Improvements', 'Breaking', 'Security', 'Performance', 'Docs'])

export const ChangelogStatusEnum = z.enum(['draft', 'published'])
export const WorkflowStateEnum = z.enum(['draft', 'pending_approval', 'approved', 'scheduled', 'published'])
export const AIProviderEnum = z.enum(['openai', 'gemini', 'ollama'])

export const ChangelogEntrySchema = z.object({
  _id: z.string(),
  title: z.string().min(1).max(200),
  slug: z.string(),
  content: z.string().min(1),
  version: z.string(),
  date: z.date(),
  status: ChangelogStatusEnum,
  workflowState: WorkflowStateEnum,
  scheduledAt: z.date().optional(),
  publishedAt: z.date().optional(),
  approvalNote: z.string().optional(),
  previewTokenVersion: z.number().optional(),
  tags: z.array(ChangelogTagEnum),
  aiGenerated: z.boolean(),
  rawNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateChangelogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  version: z.string().min(1, 'Version is required'),
  status: ChangelogStatusEnum.default('draft'),
  workflowState: WorkflowStateEnum.optional(),
  scheduledAt: z.union([z.date(), z.string()]).optional(),
  approvalNote: z.string().optional(),
  tags: z.array(ChangelogTagEnum).min(1, 'At least one tag is required'),
  rawNotes: z.string().optional(),
  aiGenerated: z.boolean().default(false),
})

export const UpdateChangelogSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  status: ChangelogStatusEnum.optional(),
  workflowState: WorkflowStateEnum.optional(),
  scheduledAt: z.union([z.date(), z.string(), z.null()]).optional(),
  approvalNote: z.union([z.string(), z.null()]).optional(),
  tags: z.array(ChangelogTagEnum).optional(),
})

export const TransitionWorkflowSchema = z.object({
  id: z.string().min(1),
  nextState: WorkflowStateEnum,
  scheduledAt: z.union([z.date(), z.string(), z.null()]).optional(),
  approvalNote: z.union([z.string(), z.null()]).optional(),
})

export const GeneratePreviewLinkSchema = z.object({
  id: z.string().min(1),
  expiresInHours: z.number().int().min(1).max(168).default(24),
})

export const EnhanceChangelogSchema = z.object({
  rawNotes: z.string().min(10, 'Notes must be at least 10 characters').max(5000, 'Notes must be less than 5000 characters'),
  currentVersion: z.string().optional(),
})

export const LoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export const FeedFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(ChangelogTagEnum).optional(),
  status: ChangelogStatusEnum.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export const AISettingsSchema = z.object({
  provider: AIProviderEnum,
  model: z.string().min(1, 'Model is required'),
  openaiApiKey: z.string().optional().default(''),
  geminiApiKey: z.string().optional().default(''),
  ollamaBaseUrl: z.string().optional().default(''),
})

export const AIModelListRequestSchema = z.object({
  provider: AIProviderEnum,
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  ollamaBaseUrl: z.string().optional(),
})

export const ChangelogSettingsSchema = z.object({
  defaultFeedPageSize: z.number().int().min(1).max(50),
  autoPublish: z.boolean(),
})

export type ChangelogEntryType = z.infer<typeof ChangelogEntrySchema>
export type CreateChangelogType = z.infer<typeof CreateChangelogSchema>
export type UpdateChangelogType = z.infer<typeof UpdateChangelogSchema>
export type EnhanceChangelogType = z.infer<typeof EnhanceChangelogSchema>
export type LoginType = z.infer<typeof LoginSchema>
export type FeedFiltersType = z.infer<typeof FeedFiltersSchema>
export type AISettingsType = z.infer<typeof AISettingsSchema>
export type AIModelListRequestType = z.infer<typeof AIModelListRequestSchema>
export type ChangelogSettingsType = z.infer<typeof ChangelogSettingsSchema>
export type TransitionWorkflowType = z.infer<typeof TransitionWorkflowSchema>
export type GeneratePreviewLinkType = z.infer<typeof GeneratePreviewLinkSchema>
