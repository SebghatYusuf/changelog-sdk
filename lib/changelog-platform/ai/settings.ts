import connectDB from '../db/mongoose'
import AISettings from '../db/models/AISettings'
import { AIProviderConfig } from './provider'
import type { AIProvider } from './constants'
import { DEFAULT_AI_MODELS } from './constants'

export interface PersistedAISettings {
  provider: AIProvider
  model: string
  openaiApiKey: string
  geminiApiKey: string
  ollamaBaseUrl: string
}

const DEFAULT_SETTINGS: PersistedAISettings = {
  provider: (process.env.CHANGELOG_AI_PROVIDER as AIProvider) || 'openai',
  model: '',
  openaiApiKey: '',
  geminiApiKey: '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
}

function getDefaultSettings(): PersistedAISettings {
  return {
    ...DEFAULT_SETTINGS,
    model: DEFAULT_AI_MODELS[DEFAULT_SETTINGS.provider],
  }
}

export async function getAISettings(): Promise<PersistedAISettings> {
  await connectDB()
  const settings = await AISettings.findOne({ key: 'default' }).lean()

  if (!settings) {
    return getDefaultSettings()
  }

  const provider = (settings.provider || DEFAULT_SETTINGS.provider) as AIProvider

  return {
    provider,
    model: settings.model || DEFAULT_AI_MODELS[provider],
    openaiApiKey: settings.openaiApiKey || '',
    geminiApiKey: settings.geminiApiKey || '',
    ollamaBaseUrl: settings.ollamaBaseUrl || DEFAULT_SETTINGS.ollamaBaseUrl,
  }
}

export async function saveAISettings(input: PersistedAISettings): Promise<PersistedAISettings> {
  const normalized: PersistedAISettings = {
    provider: input.provider,
    model: input.model || DEFAULT_AI_MODELS[input.provider],
    openaiApiKey: input.openaiApiKey || '',
    geminiApiKey: input.geminiApiKey || '',
    ollamaBaseUrl: input.ollamaBaseUrl || DEFAULT_SETTINGS.ollamaBaseUrl,
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
}

export async function getRuntimeAIConfig(): Promise<AIProviderConfig> {
  let settings: PersistedAISettings
  try {
    settings = await getAISettings()
  } catch {
    settings = getDefaultSettings()
  }
  const provider = settings.provider

  return {
    provider,
    model: settings.model || DEFAULT_AI_MODELS[provider],
    apiKey:
      provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : provider === 'gemini'
          ? process.env.GOOGLE_GENERATIVE_AI_API_KEY
          : undefined,
    baseUrl: settings.ollamaBaseUrl || process.env.OLLAMA_BASE_URL,
  }
}
