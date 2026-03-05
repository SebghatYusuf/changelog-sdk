import mongoose, { Schema } from 'mongoose'
import { AIProvider } from '../../ai/constants'

interface AISettingsModelFields {
  key: string
  provider: AIProvider
  model: string
  openaiApiKey: string | null
  geminiApiKey: string | null
  ollamaBaseUrl: string | null
}

const aiSettingsSchema = new Schema<AISettingsModelFields>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    provider: {
      type: String,
      enum: ['openai', 'gemini', 'ollama'],
      default: 'openai',
      required: true,
    },
    model: {
      type: String,
      required: true,
      default: 'gpt-4o-mini',
      trim: true,
    },
    openaiApiKey: {
      type: String,
      default: null,
      trim: true,
    },
    geminiApiKey: {
      type: String,
      default: null,
      trim: true,
    },
    ollamaBaseUrl: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'changelog_ai_settings',
  }
)

export const AISettings =
  (mongoose.models.AISettings as mongoose.Model<AISettingsModelFields>) ||
  mongoose.model<AISettingsModelFields>('AISettings', aiSettingsSchema)

export default AISettings
