/**
 * Main export for Changelog SDK
 * Next.js 16+ optimized exports for tree-shaking and proper code splitting
 */

// ===== COMPONENTS (Client-Safe) =====
export { default as ChangelogManager } from './components/manager'
export { default as ChangelogFeed } from './components/feed/timeline'
export { default as AdminPortal } from './components/admin/portal'

// ===== TYPES (Zero-runtime) =====
export type {
  AdminUser,
  ChangelogEntry,
  ChangelogStatus,
  ChangelogTag,
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  EnhanceChangelogOutput,
  FeedResponse,
  ApiError,
  LoginInput,
  RegisterAdminInput,
  AISettingsInput,
  AIModelOption,
  AIProviderKind,
  ChangelogSettingsInput,
  RepoProviderKind,
  RepoSettingsInput,
  RepoSettingsView,
  RepoCommit,
  RepoCommitQuery,
  GenerateChangelogFromCommitsOutput,
} from './types/changelog'

// ===== SERVER ACTIONS (Private by default, opt-in imports) =====
export {
  // CRUD
  createChangelog,
  updateChangelog,
  deleteChangelog,
  // Fetching
  fetchChangelogBySlug,
  fetchPublishedChangelogs,
  fetchAdminChangelogs,
  // AI
  runAIEnhance,
  // Auth
  loginAdmin,
  registerAdmin,
  canRegisterAdmin,
  logoutAdmin,
  checkAdminAuth,
  // Settings
  fetchAISettings,
  fetchAIProviderModels,
  updateAISettings,
  fetchLatestPublishedVersion,
  fetchChangelogSettings,
  updateChangelogSettings,
  fetchRepoSettings,
  updateRepoSettings,
  previewRepoCommits,
  generateChangelogFromCommits,
} from './actions/changelog-actions'

// ===== SCHEMAS (Validation) =====
export {
  ChangelogTagEnum,
  ChangelogStatusEnum,
  ChangelogEntrySchema,
  CreateChangelogSchema,
  UpdateChangelogSchema,
  EnhanceChangelogSchema,
  LoginSchema,
  RegisterAdminSchema,
  FeedFiltersSchema,
  AIProviderEnum,
  AISettingsSchema,
  AIModelListRequestSchema,
  ChangelogSettingsSchema,
  RepoProviderEnum,
  RepoSettingsSchema,
  RepoCommitQuerySchema,
} from './schemas/changelog'

// ===== DATABASE (Advanced users only) =====
export { connectDB, disconnectDB } from './db/mongoose'
export { Changelog } from './db/models/Changelog'

// ===== AI (Advanced) =====
export { AIProviderFactory } from './ai/provider'
export { default as enhanceChangelog } from './ai/enhancer'

// ===== MIDDLEWARE (Advanced) =====
export { authMiddleware } from './middleware/auth'

// ===== STYLES (Auto-included via entrypoint) =====
import './styles/changelog-ui.css'
