'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcryptjs from 'bcryptjs'
import connectDB from '../db/mongoose'
import { Changelog } from '../db/models/Changelog'
import {
  AIModelListRequestSchema,
  AISettingsSchema,
  ChangelogSettingsSchema,
  CreateChangelogSchema,
  EnhanceChangelogSchema,
  GeneratePreviewLinkSchema,
  TransitionWorkflowSchema,
  UpdateChangelogSchema,
} from '../schemas/changelog'
import { enhanceChangelog } from '../ai/enhancer'
import {
  ActionContextInput,
  AIModelOption,
  ChangelogEntry,
  ChangelogSettingsInput,
  EnhanceChangelogOutput,
  PreviewLinkResult,
  TransitionWorkflowInput,
  WorkflowState,
} from '../types/changelog'
import { AIProviderFactory } from '../ai/provider'
import { DEFAULT_AI_MODELS } from '../ai/constants'
import { getAISettings, saveAISettings } from '../ai/settings'
import { getChangelogSettings, saveChangelogSettings } from '../changelog/settings'
import { compareSemver, normalizeSemver, parseSemver } from '../changelog/semver'
import { assertWorkflowTransition, deriveStatusFromWorkflow, getWorkflowFromStatus } from '../changelog/workflow'
import { slugifyTitle, slugWithSuffix } from '../changelog/slug'
import { generatePreviewToken, verifyPreviewToken } from '../changelog/preview'
import { emitChangelogEvent, reportSDKError } from '../runtime/events'
import { joinPath, normalizeBasePath } from '../runtime/paths'

/**
 * Server Actions for Changelog CRUD and AI operations
 */

function toChangelogEntry(doc: any): ChangelogEntry {
  const workflowState = (doc.workflowState || getWorkflowFromStatus(doc.status)) as WorkflowState
  return {
    _id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    version: doc.version,
    date: new Date(doc.date),
    status: doc.status,
    workflowState,
    scheduledAt: doc.scheduledAt ? new Date(doc.scheduledAt) : undefined,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    approvalNote: doc.approvalNote ?? undefined,
    previewTokenVersion: typeof doc.previewTokenVersion === 'number' ? doc.previewTokenVersion : 0,
    tags: doc.tags,
    aiGenerated: Boolean(doc.aiGenerated),
    rawNotes: doc.rawNotes ?? undefined,
    createdAt: new Date(doc.createdAt ?? doc.date),
    updatedAt: new Date(doc.updatedAt ?? doc.date),
  }
}

function revalidateBasePath(context?: ActionContextInput): void {
  revalidatePath(normalizeBasePath(context?.basePath))
}

function parseDateInput(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseDuplicateKey(error: unknown): string | null {
  const candidate = error as { code?: number; keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> }
  if (candidate?.code !== 11000) return null
  const field = Object.keys(candidate.keyPattern || {})[0] || Object.keys(candidate.keyValue || {})[0]
  return field || null
}

function mapCreateOrUpdateError(error: unknown): string {
  const duplicateField = parseDuplicateKey(error)

  if (duplicateField === 'slug') {
    return 'An entry with this title/slug already exists. Please adjust the title.'
  }

  if (duplicateField === 'version') {
    return 'This version already exists. Edit the existing changelog entry or choose a new version.'
  }

  return error instanceof Error ? error.message : 'Request failed'
}

async function getHighestChangelogVersion(excludeId?: string): Promise<string | null> {
  const query = excludeId ? { _id: { $ne: excludeId } } : {}
  const entries = await Changelog.find(query).select('version').lean()

  let highest: string | null = null
  for (const entry of entries) {
    const version = normalizeSemver(String(entry.version || ''))
    if (!parseSemver(version)) continue

    if (!highest || compareSemver(version, highest) > 0) {
      highest = version
    }
  }

  return highest
}

async function assertVersionNotLower(candidateVersion: string, excludeId?: string): Promise<void> {
  if (!parseSemver(candidateVersion)) {
    throw new Error('Version must use semantic format (e.g. 1.2.3)')
  }

  const highestVersion = await getHighestChangelogVersion(excludeId)
  if (!highestVersion) return

  if (compareSemver(candidateVersion, highestVersion) <= 0) {
    throw new Error("This version is already deployed and can't be added again. If you need changes, edit the existing changelog entry.")
  }
}

async function applyDueScheduledPublishes(): Promise<void> {
  const now = new Date()
  await Changelog.updateMany(
    {
      workflowState: 'scheduled',
      scheduledAt: { $lte: now },
    },
    {
      $set: {
        workflowState: 'published',
        status: 'published',
        publishedAt: now,
      },
    }
  )
}

function resolveWorkflowForCreate(input: {
  status: 'draft' | 'published'
  workflowState?: WorkflowState
  autoPublish: boolean
}): WorkflowState {
  if (input.workflowState) return input.workflowState
  if (input.autoPublish) return 'published'
  return getWorkflowFromStatus(input.status)
}

function applyWorkflowFields(nextState: WorkflowState, input: { scheduledAt?: unknown; approvalNote?: unknown }) {
  const derivedStatus = deriveStatusFromWorkflow(nextState)
  const scheduledAt = parseDateInput(input.scheduledAt)
  const publishedAt = nextState === 'published' ? new Date() : null

  if (nextState === 'scheduled' && !scheduledAt) {
    throw new Error('A valid scheduled date is required when workflow state is scheduled.')
  }

  return {
    workflowState: nextState,
    status: derivedStatus,
    scheduledAt: nextState === 'scheduled' ? scheduledAt : null,
    publishedAt,
    approvalNote: typeof input.approvalNote === 'string' && input.approvalNote.trim() ? input.approvalNote.trim() : null,
  }
}

async function ensureAdmin(): Promise<boolean> {
  const isAdmin = await checkAdminAuth()
  return isAdmin
}

// ===== CHANGELOG CRUD ACTIONS =====

export async function createChangelog(
  input: unknown,
  context?: ActionContextInput
): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()
    await applyDueScheduledPublishes()

    const validated = CreateChangelogSchema.parse(input)
    const normalizedVersion = normalizeSemver(validated.version)
    await assertVersionNotLower(normalizedVersion)

    const currentSettings = await getChangelogSettings()
    const workflowState = resolveWorkflowForCreate({
      status: validated.status,
      workflowState: validated.workflowState,
      autoPublish: currentSettings.autoPublish,
    })

    const workflowFields = applyWorkflowFields(workflowState, {
      scheduledAt: validated.scheduledAt,
      approvalNote: validated.approvalNote,
    })

    const baseSlug = slugifyTitle(validated.title) || `release-${Date.now()}`

    let created: any = null
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidateSlug = slugWithSuffix(baseSlug, attempt)
      try {
        const existingSlug = await Changelog.exists({ slug: candidateSlug })
        if (existingSlug) {
          continue
        }

        const changelog = new Changelog({
          title: validated.title,
          slug: candidateSlug,
          content: validated.content,
          version: normalizedVersion,
          tags: validated.tags,
          aiGenerated: validated.aiGenerated,
          rawNotes: validated.rawNotes,
          previewTokenVersion: 0,
          ...workflowFields,
        })

        created = await changelog.save()
        break
      } catch (error) {
        const duplicateField = parseDuplicateKey(error)
        if (duplicateField === 'slug') {
          continue
        }
        throw error
      }
    }

    if (!created) {
      throw new Error('Could not generate a unique slug for this entry. Please adjust the title and retry.')
    }

    revalidateBasePath(context)

    const entry = toChangelogEntry(created.toObject())
    await emitChangelogEvent('entry.created', {
      id: entry._id,
      slug: entry.slug,
      version: entry.version,
      workflowState: entry.workflowState,
    })

    if (entry.workflowState === 'published') {
      await emitChangelogEvent('entry.published', {
        id: entry._id,
        slug: entry.slug,
        version: entry.version,
      })
    }

    return { success: true, data: entry }
  } catch (error) {
    await reportSDKError(error, { action: 'createChangelog' })
    return {
      success: false,
      error: mapCreateOrUpdateError(error),
    }
  }
}

export async function updateChangelog(
  input: unknown,
  context?: ActionContextInput
): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()
    await applyDueScheduledPublishes()

    const validated = UpdateChangelogSchema.parse(input)
    const existing = await Changelog.findById(validated.id)

    if (!existing) {
      return {
        success: false,
        error: 'Changelog entry not found',
      }
    }

    const normalizedVersion = validated.version ? normalizeSemver(validated.version) : undefined
    if (normalizedVersion) {
      const existingVersion = normalizeSemver(String(existing.version || ''))
      if (normalizedVersion !== existingVersion) {
        await assertVersionNotLower(normalizedVersion, validated.id)
      }
    }

    const nextWorkflowState = validated.workflowState || (existing.workflowState as WorkflowState) || getWorkflowFromStatus(existing.status)
    const currentWorkflowState = (existing.workflowState as WorkflowState) || getWorkflowFromStatus(existing.status)

    if (nextWorkflowState !== currentWorkflowState) {
      assertWorkflowTransition({ current: currentWorkflowState, next: nextWorkflowState })
    }

    const workflowFields = applyWorkflowFields(nextWorkflowState, {
      scheduledAt: validated.scheduledAt ?? existing.scheduledAt,
      approvalNote: validated.approvalNote ?? existing.approvalNote,
    })

    existing.title = validated.title ?? existing.title
    existing.content = validated.content ?? existing.content
    existing.version = normalizedVersion ?? existing.version
    existing.tags = validated.tags ?? existing.tags
    existing.workflowState = workflowFields.workflowState
    existing.status = workflowFields.status
    existing.scheduledAt = workflowFields.scheduledAt
    existing.publishedAt = workflowFields.publishedAt ?? existing.publishedAt
    existing.approvalNote = workflowFields.approvalNote

    const updated = await existing.save()

    revalidateBasePath(context)

    const entry = toChangelogEntry(updated.toObject())
    await emitChangelogEvent('entry.updated', {
      id: entry._id,
      slug: entry.slug,
      version: entry.version,
      workflowState: entry.workflowState,
    })

    if (entry.workflowState === 'approved') {
      await emitChangelogEvent('entry.approved', {
        id: entry._id,
        slug: entry.slug,
        version: entry.version,
      })
    }

    if (entry.workflowState === 'scheduled') {
      await emitChangelogEvent('entry.scheduled', {
        id: entry._id,
        slug: entry.slug,
        version: entry.version,
        scheduledAt: entry.scheduledAt?.toISOString(),
      })
    }

    if (entry.workflowState === 'published') {
      await emitChangelogEvent('entry.published', {
        id: entry._id,
        slug: entry.slug,
        version: entry.version,
      })
    }

    return {
      success: true,
      data: entry,
    }
  } catch (error) {
    await reportSDKError(error, { action: 'updateChangelog' })
    return {
      success: false,
      error: mapCreateOrUpdateError(error),
    }
  }
}

export async function transitionChangelogWorkflow(
  input: TransitionWorkflowInput,
  context?: ActionContextInput
): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = TransitionWorkflowSchema.parse(input)
    return updateChangelog(
      {
        id: validated.id,
        workflowState: validated.nextState,
        scheduledAt: validated.scheduledAt,
        approvalNote: validated.approvalNote,
      },
      context
    )
  } catch (error) {
    await reportSDKError(error, { action: 'transitionChangelogWorkflow' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transition workflow',
    }
  }
}

export async function deleteChangelog(id: string, context?: ActionContextInput): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()

    const result = await Changelog.findByIdAndDelete(id)

    if (!result) {
      return {
        success: false,
        error: 'Changelog entry not found',
      }
    }

    revalidateBasePath(context)

    await emitChangelogEvent('entry.deleted', {
      id: String(result._id),
      slug: result.slug,
      version: result.version,
    })

    return { success: true }
  } catch (error) {
    await reportSDKError(error, { action: 'deleteChangelog' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete changelog',
    }
  }
}

export async function generateChangelogPreviewLink(
  input: unknown,
  context?: ActionContextInput
): Promise<{ success: boolean; data?: PreviewLinkResult; error?: string }> {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()
    const validated = GeneratePreviewLinkSchema.parse(input)
    const entry = await Changelog.findById(validated.id)

    if (!entry) {
      return { success: false, error: 'Changelog entry not found' }
    }

    const expiresAt = new Date(Date.now() + validated.expiresInHours * 60 * 60 * 1000)
    const token = generatePreviewToken({
      id: String(entry._id),
      exp: expiresAt.getTime(),
      v: Number(entry.previewTokenVersion || 0),
    })

    const basePath = normalizeBasePath(context?.basePath)
    const url = joinPath(basePath, 'preview', token)

    await emitChangelogEvent('entry.preview_link_created', {
      id: String(entry._id),
      slug: entry.slug,
      expiresAt: expiresAt.toISOString(),
    })

    return {
      success: true,
      data: {
        url,
        token,
        expiresAt,
      },
    }
  } catch (error) {
    await reportSDKError(error, { action: 'generateChangelogPreviewLink' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create preview link',
    }
  }
}

// ===== AI ENHANCEMENT ACTION =====

export async function runAIEnhance(input: unknown): Promise<{ success: boolean; data?: EnhanceChangelogOutput; error?: string }> {
  try {
    const validated = EnhanceChangelogSchema.parse(input)
    const result = await enhanceChangelog(validated.rawNotes, validated.currentVersion)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    await reportSDKError(error, { action: 'runAIEnhance' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enhance changelog',
    }
  }
}

// ===== AUTHENTICATION ACTIONS =====

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminPassword = process.env.CHANGELOG_ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSWORD?.trim()

    if (!adminPassword) {
      return {
        success: false,
        error: 'Admin password not configured. If using a bcrypt hash in .env.local, escape "$" as "\\$".',
      }
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(adminPassword)
    const isValid = isBcryptHash ? await bcryptjs.compare(password, adminPassword) : password === adminPassword

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid password',
      }
    }

    const cookieStore = await cookies()
    cookieStore.set('changelog-admin-session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    })

    return { success: true }
  } catch (error) {
    await reportSDKError(error, { action: 'loginAdmin' })
    return {
      success: false,
      error: 'Authentication failed',
    }
  }
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('changelog-admin-session')
    return { success: true }
  } catch (error) {
    await reportSDKError(error, { action: 'logoutAdmin' })
    return { success: false }
  }
}

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return !!cookieStore.get('changelog-admin-session')?.value
  } catch {
    return false
  }
}

// ===== AI SETTINGS ACTIONS =====

export async function fetchAISettings() {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' as const }
    }

    const settings = await getAISettings()
    return { success: true, data: settings }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchAISettings' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch AI settings',
    }
  }
}

export async function fetchAIProviderModels(input: unknown): Promise<{ success: boolean; data?: AIModelOption[]; error?: string }> {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = AIModelListRequestSchema.parse(input)

    const models = await AIProviderFactory.listModels({
      provider: validated.provider,
      apiKey: undefined,
      baseUrl: validated.ollamaBaseUrl,
    })

    if (models.length === 0) {
      return {
        success: true,
        data: [{ id: DEFAULT_AI_MODELS[validated.provider], name: DEFAULT_AI_MODELS[validated.provider] }],
      }
    }

    return { success: true, data: models }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchAIProviderModels' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models',
    }
  }
}

export async function updateAISettings(input: unknown) {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' as const }
    }

    const validated = AISettingsSchema.parse(input)
    const provider = validated.provider

    const saved = await saveAISettings({
      provider,
      model: validated.model || DEFAULT_AI_MODELS[provider],
      openaiApiKey: '',
      geminiApiKey: '',
      ollamaBaseUrl: validated.ollamaBaseUrl || '',
    })

    return { success: true, data: saved }
  } catch (error) {
    await reportSDKError(error, { action: 'updateAISettings' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update AI settings',
    }
  }
}

// ===== CHANGELOG SETTINGS ACTIONS =====

export async function fetchChangelogSettings() {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' as const }
    }

    const settings = await getChangelogSettings()
    return { success: true, data: settings }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchChangelogSettings' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch changelog settings',
    }
  }
}

export async function updateChangelogSettings(input: unknown) {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' as const }
    }

    const validated = ChangelogSettingsSchema.parse(input)
    const normalized: ChangelogSettingsInput = {
      defaultFeedPageSize: validated.defaultFeedPageSize,
      autoPublish: validated.autoPublish,
    }
    const saved = await saveChangelogSettings(normalized)
    return { success: true, data: saved }
  } catch (error) {
    await reportSDKError(error, { action: 'updateChangelogSettings' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update changelog settings',
    }
  }
}

export async function fetchLatestPublishedVersion(): Promise<{ success: boolean; data?: { version: string }; error?: string }> {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()
    await applyDueScheduledPublishes()

    const entries = await Changelog.find({ status: 'published' }).select('version').lean()
    let highestVersion = '1.0.0'

    for (const entry of entries) {
      const version = normalizeSemver(String(entry.version || ''))
      if (!parseSemver(version)) continue

      if (compareSemver(version, highestVersion) > 0) {
        highestVersion = version
      }
    }

    return {
      success: true,
      data: { version: highestVersion },
    }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchLatestPublishedVersion' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch latest published version',
    }
  }
}

// ===== DATA FETCHING ACTIONS =====

export async function fetchChangelogBySlug(slug: string): Promise<{ data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()
    await applyDueScheduledPublishes()

    const changelog = await Changelog.findOne({ slug })

    if (!changelog) {
      return {
        error: 'Changelog not found',
      }
    }

    return {
      data: toChangelogEntry(changelog.toObject()),
    }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchChangelogBySlug' })
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch changelog',
    }
  }
}

export async function fetchChangelogByPreviewToken(token: string): Promise<{ data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()

    const payload = verifyPreviewToken(token)
    if (!payload) {
      return { error: 'Preview link is invalid or expired.' }
    }

    const changelog = await Changelog.findById(payload.id)
    if (!changelog) {
      return { error: 'Preview entry not found.' }
    }

    if (Number(changelog.previewTokenVersion || 0) !== payload.v) {
      return { error: 'Preview link is no longer valid.' }
    }

    return {
      data: toChangelogEntry(changelog.toObject()),
    }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchChangelogByPreviewToken' })
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch preview entry',
    }
  }
}

export async function fetchPublishedChangelogs(page: number = 1, limit: number = 10, tags?: string[], search?: string) {
  try {
    await connectDB()
    await applyDueScheduledPublishes()

    const skip = (page - 1) * limit
    const query: any = { status: 'published' }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags }
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }]
    }

    const total = await Changelog.countDocuments(query)
    const entries = await Changelog.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return {
      success: true,
      data: {
        entries: entries.map(toChangelogEntry),
        total,
        page,
        limit,
        hasMore: page * limit < total,
      },
    }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchPublishedChangelogs' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch published changelogs',
      data: {
        entries: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      },
    }
  }
}

export async function fetchAdminChangelogs(page: number = 1, limit: number = 20) {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    await connectDB()
    await applyDueScheduledPublishes()

    const skip = (page - 1) * limit
    const total = await Changelog.countDocuments()
    const entries = await Changelog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return {
      success: true,
      data: {
        entries: entries.map(toChangelogEntry),
        total,
        page,
        limit,
        hasMore: page * limit < total,
      },
    }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchAdminChangelogs' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch admin changelogs',
      data: {
        entries: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      },
    }
  }
}

export async function fetchAdminChangelogById(id: string): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
  try {
    const isAdmin = await ensureAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()
    const entry = await Changelog.findById(id).lean()

    if (!entry) {
      return { success: false, error: 'Changelog entry not found' }
    }

    return {
      success: true,
      data: toChangelogEntry(entry),
    }
  } catch (error) {
    await reportSDKError(error, { action: 'fetchAdminChangelogById' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch changelog entry',
    }
  }
}
