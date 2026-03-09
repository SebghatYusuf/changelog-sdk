import connectDB from '../changelog-platform/db/mongoose'
import { Changelog } from '../changelog-platform/db/models/Changelog'
import AISettings from '../changelog-platform/db/models/AISettings'
import ChangelogSettings from '../changelog-platform/db/models/ChangelogSettings'
import type {
  AISettingsRepository,
  ChangelogRepository,
  SettingsRepository,
} from '../core/ports'
import type {
  ChangelogEntry,
  ChangelogSettingsInput,
  FeedResponse,
  PersistedAISettings,
  PersistedChangelogSettings,
  UpdateChangelogInput,
} from '../core/types'
import { DEFAULT_AI_MODELS } from '../core/constants'

function toChangelogEntry(doc: any): ChangelogEntry {
  return {
    _id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    version: doc.version,
    date: new Date(doc.date),
    status: doc.status,
    tags: doc.tags,
    aiGenerated: Boolean(doc.aiGenerated),
    rawNotes: doc.rawNotes ?? undefined,
    createdAt: new Date(doc.createdAt ?? doc.date),
    updatedAt: new Date(doc.updatedAt ?? doc.date),
  }
}

export function createMongooseChangelogRepository(): ChangelogRepository {
  return {
    async create(input) {
      await connectDB()
      const doc = new Changelog(input)
      await doc.save()
      return toChangelogEntry(doc.toObject())
    },

    async update(id: string, patch: Omit<UpdateChangelogInput, 'id'>) {
      await connectDB()
      const doc = await Changelog.findByIdAndUpdate(
        id,
        {
          ...(patch.title && { title: patch.title }),
          ...(patch.content && { content: patch.content }),
          ...(patch.version && { version: patch.version }),
          ...(patch.status && { status: patch.status }),
          ...(patch.tags && { tags: patch.tags }),
        },
        { new: true, runValidators: true }
      )

      if (!doc) return null
      return toChangelogEntry(doc.toObject())
    },

    async remove(id: string) {
      await connectDB()
      const result = await Changelog.findByIdAndDelete(id)
      return Boolean(result)
    },

    async findBySlug(slug: string) {
      await connectDB()
      const doc = await Changelog.findOne({ slug })
      if (!doc) return null
      return toChangelogEntry(doc.toObject())
    },

    async findById(id: string) {
      await connectDB()
      const doc = await Changelog.findById(id).lean()
      if (!doc) return null
      return toChangelogEntry(doc)
    },

    async listPublished({ page, limit, tags, search }): Promise<FeedResponse> {
      await connectDB()
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
        entries: entries.map(toChangelogEntry),
        total,
        page,
        limit,
        hasMore: page * limit < total,
      }
    },

    async listAdmin({ page, limit }): Promise<FeedResponse> {
      await connectDB()
      const skip = (page - 1) * limit
      const total = await Changelog.countDocuments()
      const entries = await Changelog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      return {
        entries: entries.map(toChangelogEntry),
        total,
        page,
        limit,
        hasMore: page * limit < total,
      }
    },

    async listVersions(excludeId?: string) {
      await connectDB()
      const query = excludeId ? { _id: { $ne: excludeId } } : {}
      const entries = await Changelog.find(query).select('version').lean()
      return entries.map((entry) => String(entry.version || ''))
    },

    async listPublishedVersions() {
      await connectDB()
      const entries = await Changelog.find({ status: 'published' }).select('version').lean()
      return entries.map((entry) => String(entry.version || ''))
    },
  }
}

const DEFAULT_CHANGELOG_SETTINGS: PersistedChangelogSettings = {
  defaultFeedPageSize: 10,
  autoPublish: false,
}

function normalizeSettings(input: Partial<PersistedChangelogSettings>): PersistedChangelogSettings {
  return {
    defaultFeedPageSize:
      typeof input.defaultFeedPageSize === 'number'
        ? Math.min(50, Math.max(1, input.defaultFeedPageSize))
        : DEFAULT_CHANGELOG_SETTINGS.defaultFeedPageSize,
    autoPublish: typeof input.autoPublish === 'boolean' ? input.autoPublish : DEFAULT_CHANGELOG_SETTINGS.autoPublish,
  }
}

export function createMongooseSettingsRepository(): SettingsRepository {
  return {
    async get() {
      await connectDB()
      const settings = await ChangelogSettings.findOne({ key: 'default' }).lean()

      if (!settings) {
        return DEFAULT_CHANGELOG_SETTINGS
      }

      return normalizeSettings({
        defaultFeedPageSize: settings.defaultFeedPageSize,
        autoPublish: settings.autoPublish,
      })
    },

    async save(input: ChangelogSettingsInput) {
      const normalized = normalizeSettings(input)
      await connectDB()

      await ChangelogSettings.findOneAndUpdate(
        { key: 'default' },
        {
          key: 'default',
          defaultFeedPageSize: normalized.defaultFeedPageSize,
          autoPublish: normalized.autoPublish,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      )

      return normalized
    },
  }
}

const DEFAULT_AI_SETTINGS: PersistedAISettings = {
  provider: (process.env.CHANGELOG_AI_PROVIDER as PersistedAISettings['provider']) || 'openai',
  model: '',
  openaiApiKey: '',
  geminiApiKey: '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
}

function getDefaultAISettings(): PersistedAISettings {
  return {
    ...DEFAULT_AI_SETTINGS,
    model: DEFAULT_AI_MODELS[DEFAULT_AI_SETTINGS.provider],
  }
}

export function createMongooseAISettingsRepository(): AISettingsRepository {
  return {
    async get() {
      await connectDB()
      const settings = await AISettings.findOne({ key: 'default' }).lean()

      if (!settings) {
        return getDefaultAISettings()
      }

      const provider = (settings.provider || DEFAULT_AI_SETTINGS.provider) as PersistedAISettings['provider']

      return {
        provider,
        model: settings.model || DEFAULT_AI_MODELS[provider],
        openaiApiKey: settings.openaiApiKey || '',
        geminiApiKey: settings.geminiApiKey || '',
        ollamaBaseUrl: settings.ollamaBaseUrl || DEFAULT_AI_SETTINGS.ollamaBaseUrl,
      }
    },

    async save(input) {
      const normalized: PersistedAISettings = {
        provider: input.provider,
        model: input.model || DEFAULT_AI_MODELS[input.provider],
        openaiApiKey: input.openaiApiKey || '',
        geminiApiKey: input.geminiApiKey || '',
        ollamaBaseUrl: input.ollamaBaseUrl || DEFAULT_AI_SETTINGS.ollamaBaseUrl,
      }

      await connectDB()

      await AISettings.findOneAndUpdate(
        { key: 'default' },
        {
          key: 'default',
          provider: normalized.provider,
          model: normalized.model,
          openaiApiKey: normalized.openaiApiKey || null,
          geminiApiKey: normalized.geminiApiKey || null,
          ollamaBaseUrl: normalized.ollamaBaseUrl || null,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      )

      return normalized
    },
  }
}
