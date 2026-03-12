import mongoose, { Schema } from 'mongoose'

interface RepoSettingsModelFields {
  key: string
  provider: 'git' | 'bitbucket'
  repoUrl: string | null
  workspace: string | null
  repoSlug: string | null
  branch: string
  tokenEncrypted: string | null
  tokenIv: string | null
  tokenTag: string | null
  enabled: boolean
}

const repoSettingsSchema = new Schema<RepoSettingsModelFields>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    provider: {
      type: String,
      enum: ['git', 'bitbucket'],
      required: true,
      default: 'git',
    },
    repoUrl: {
      type: String,
      default: null,
      trim: true,
    },
    workspace: {
      type: String,
      default: null,
      trim: true,
    },
    repoSlug: {
      type: String,
      default: null,
      trim: true,
    },
    branch: {
      type: String,
      default: 'main',
      trim: true,
    },
    tokenEncrypted: {
      type: String,
      default: null,
    },
    tokenIv: {
      type: String,
      default: null,
    },
    tokenTag: {
      type: String,
      default: null,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'changelog_repo_settings',
  }
)

export const RepoSettings =
  (mongoose.models.RepoSettings as mongoose.Model<RepoSettingsModelFields>) ||
  mongoose.model<RepoSettingsModelFields>('RepoSettings', repoSettingsSchema)

export default RepoSettings
