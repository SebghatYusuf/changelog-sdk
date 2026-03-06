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
  ActionContextInput,
  ChangelogEntry,
  ChangelogStatus,
  ChangelogTag,
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  EnhanceChangelogOutput,
  FeedResponse,
  ApiError,
  AISettingsInput,
  AIModelOption,
  AIProviderKind,
  ChangelogSettingsInput,
  PreviewLinkResult,
  TransitionWorkflowInput,
  WorkflowState,
} from './types/changelog'

// ===== SERVER ACTIONS (Private by default, opt-in imports) =====
export {
  // CRUD
  createChangelog,
  updateChangelog,
  transitionChangelogWorkflow,
  deleteChangelog,
  generateChangelogPreviewLink,
  // Fetching
  fetchChangelogBySlug,
  fetchChangelogByPreviewToken,
  fetchPublishedChangelogs,
  fetchAdminChangelogs,
  // AI
  runAIEnhance,
  // Auth
  loginAdmin,
  logoutAdmin,
  checkAdminAuth,
  // Settings
  fetchAISettings,
  fetchAIProviderModels,
  updateAISettings,
  fetchLatestPublishedVersion,
  fetchChangelogSettings,
  updateChangelogSettings,
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
  FeedFiltersSchema,
  AIProviderEnum,
  AISettingsSchema,
  AIModelListRequestSchema,
  ChangelogSettingsSchema,
  WorkflowStateEnum,
  TransitionWorkflowSchema,
  GeneratePreviewLinkSchema,
} from './schemas/changelog'

// ===== DATABASE (Advanced users only) =====
export { connectDB, disconnectDB } from './db/mongoose'
export { Changelog } from './db/models/Changelog'

// ===== AI (Advanced) =====
export { AIProviderFactory } from './ai/provider'
export { default as enhanceChangelog } from './ai/enhancer'
export { configureChangelogSDK } from './runtime/config'
export { onChangelogEvent } from './runtime/events'
export type { ChangelogEvent, ChangelogEventName, ChangelogSDKConfig, SDKLogger, WebhookTarget } from './runtime/config'

// ===== MIDDLEWARE (Advanced) =====
export { authMiddleware } from './middleware/auth'

// ===== STYLES (Auto-included via entrypoint) =====
import './styles/changelog-ui.css'
