/**
 * Main export for Changelog SDK
 */

export { default as ChangelogManager } from './components/manager'
export { default as ChangelogFeed } from './components/feed/timeline'
export { default as AdminPortal } from './components/admin/portal'

// Export types
export type {
  ChangelogEntry,
  ChangelogStatus,
  ChangelogTag,
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  EnhanceChangelogOutput,
  FeedResponse,
  ApiError,
} from './types/changelog'

// Export actions
export {
  createChangelog,
  updateChangelog,
  deleteChangelog,
  runAIEnhance,
  loginAdmin,
  logoutAdmin,
  checkAdminAuth,
  fetchChangelogBySlug,
  fetchPublishedChangelogs,
  fetchAdminChangelogs,
} from './actions/changelog-actions'

// Export schemas
export {
  ChangelogTagEnum,
  ChangelogStatusEnum,
  ChangelogEntrySchema,
  CreateChangelogSchema,
  UpdateChangelogSchema,
  EnhanceChangelogSchema,
  LoginSchema,
  FeedFiltersSchema,
} from './schemas/changelog'

// Export database
export { connectDB, disconnectDB } from './db/mongoose'
export { Changelog } from './db/models/Changelog'

// Export AI
export { AIProviderFactory } from './ai/provider'
export { default as enhanceChangelog } from './ai/enhancer'

// Export middleware
export { authMiddleware } from './middleware/auth'

// Styles
import './styles/scoped-shadcn.css'
