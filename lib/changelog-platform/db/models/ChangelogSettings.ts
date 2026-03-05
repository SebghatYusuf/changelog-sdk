import mongoose, { Schema } from 'mongoose'

interface ChangelogSettingsModelFields {
  key: string
  currentVersion: string
  defaultFeedPageSize: number
  autoPublish: boolean
}

const changelogSettingsSchema = new Schema<ChangelogSettingsModelFields>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    currentVersion: {
      type: String,
      required: true,
      default: '1.0.0',
      trim: true,
    },
    defaultFeedPageSize: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
      max: 50,
    },
    autoPublish: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'changelog_settings',
  }
)

export const ChangelogSettings =
  (mongoose.models.ChangelogSettings as mongoose.Model<ChangelogSettingsModelFields>) ||
  mongoose.model<ChangelogSettingsModelFields>('ChangelogSettings', changelogSettingsSchema)

export default ChangelogSettings
