import connectDB from '../db/mongoose'
import ChangelogSettings from '../db/models/ChangelogSettings'

export interface PersistedChangelogSettings {
  currentVersion: string
  defaultFeedPageSize: number
  autoPublish: boolean
}

const DEFAULT_CHANGELOG_SETTINGS: PersistedChangelogSettings = {
  currentVersion: '1.0.0',
  defaultFeedPageSize: 10,
  autoPublish: false,
}

function normalizeSettings(input: Partial<PersistedChangelogSettings>): PersistedChangelogSettings {
  return {
    currentVersion: input.currentVersion?.trim() || DEFAULT_CHANGELOG_SETTINGS.currentVersion,
    defaultFeedPageSize:
      typeof input.defaultFeedPageSize === 'number'
        ? Math.min(50, Math.max(1, input.defaultFeedPageSize))
        : DEFAULT_CHANGELOG_SETTINGS.defaultFeedPageSize,
    autoPublish: typeof input.autoPublish === 'boolean' ? input.autoPublish : DEFAULT_CHANGELOG_SETTINGS.autoPublish,
  }
}

export async function getChangelogSettings(): Promise<PersistedChangelogSettings> {
  await connectDB()
  const settings = await ChangelogSettings.findOne({ key: 'default' }).lean()

  if (!settings) {
    return DEFAULT_CHANGELOG_SETTINGS
  }

  return normalizeSettings({
    currentVersion: settings.currentVersion,
    defaultFeedPageSize: settings.defaultFeedPageSize,
    autoPublish: settings.autoPublish,
  })
}

export async function saveChangelogSettings(input: PersistedChangelogSettings): Promise<PersistedChangelogSettings> {
  const normalized = normalizeSettings(input)

  await connectDB()

  await ChangelogSettings.findOneAndUpdate(
    { key: 'default' },
    {
      key: 'default',
      currentVersion: normalized.currentVersion,
      defaultFeedPageSize: normalized.defaultFeedPageSize,
      autoPublish: normalized.autoPublish,
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  )

  return normalized
}
