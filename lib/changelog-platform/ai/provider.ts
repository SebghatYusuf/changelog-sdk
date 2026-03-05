import { LanguageModel } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOllama } from 'ollama-ai-provider-v2'
import { AIProvider, DEFAULT_AI_MODELS } from './constants'

/**
 * AI Provider Factory
 * Supports OpenAI, Google Gemini, and Ollama
 */

export interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface AIProviderModelOption {
  id: string
  name: string
}

export class AIProviderFactory {
  static getProvider(config?: AIProviderConfig): LanguageModel {
    const provider = config?.provider || (process.env.CHANGELOG_AI_PROVIDER as AIProvider) || 'openai'

    switch (provider) {
      case 'openai':
        return this.getOpenAIProvider(config?.apiKey, config?.model)

      case 'gemini':
        return this.getGeminiProvider(config?.apiKey, config?.model)

      case 'ollama':
        return this.getOllamaProvider(config?.baseUrl, config?.model)

      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  private static getOpenAIProvider(apiKeyFromConfig?: string, modelFromConfig?: string): LanguageModel {
    const apiKey = apiKeyFromConfig || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not defined')
    }

    const openai = createOpenAI({
      apiKey,
    })

    return openai(modelFromConfig || DEFAULT_AI_MODELS.openai)
  }

  private static getGeminiProvider(apiKeyFromConfig?: string, modelFromConfig?: string): LanguageModel {
    const apiKey = apiKeyFromConfig || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not defined')
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    })

    return google(modelFromConfig || DEFAULT_AI_MODELS.gemini)
  }

  private static getOllamaProvider(baseUrl?: string, modelFromConfig?: string): LanguageModel {
    const ollamaBaseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

    const ollama = createOllama({
      baseURL: ollamaBaseUrl,
    })

    return ollama(modelFromConfig || DEFAULT_AI_MODELS.ollama)
  }

  static async listModels(config: Pick<AIProviderConfig, 'provider' | 'apiKey' | 'baseUrl'>): Promise<AIProviderModelOption[]> {
    const provider = config.provider

    switch (provider) {
      case 'openai':
        return this.listOpenAIModels(config.apiKey)
      case 'gemini':
        return this.listGeminiModels(config.apiKey)
      case 'ollama':
        return this.listOllamaModels(config.baseUrl)
      default:
        return []
    }
  }

  private static async listOpenAIModels(apiKeyFromConfig?: string): Promise<AIProviderModelOption[]> {
    const apiKey = apiKeyFromConfig || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`OpenAI models request failed (${response.status})`)
    }

    const json = await response.json() as { data?: Array<{ id: string }> }
    const models = (json.data || [])
      .map((m) => m.id)
      .filter((id) => id.startsWith('gpt-') || id.startsWith('o'))
      .sort()

    return models.map((id) => ({ id, name: id }))
  }

  private static async listGeminiModels(apiKeyFromConfig?: string): Promise<AIProviderModelOption[]> {
    const apiKey = apiKeyFromConfig || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      throw new Error('Gemini API key is required')
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`)
    if (!response.ok) {
      throw new Error(`Gemini models request failed (${response.status})`)
    }

    const json = await response.json() as { models?: Array<{ name: string; displayName?: string; supportedGenerationMethods?: string[] }> }
    const models = (json.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => ({
        id: m.name.replace(/^models\//, ''),
        name: m.displayName || m.name.replace(/^models\//, ''),
      }))
      .sort((a, b) => a.id.localeCompare(b.id))

    return models
  }

  private static async listOllamaModels(baseUrl?: string): Promise<AIProviderModelOption[]> {
    const ollamaBaseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const response = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/tags`)
    if (!response.ok) {
      throw new Error(`Ollama models request failed (${response.status})`)
    }

    const json = await response.json() as { models?: Array<{ name: string; model?: string }> }
    const models = (json.models || [])
      .map((m) => m.model || m.name)
      .filter(Boolean)
      .sort()

    return models.map((id) => ({ id, name: id }))
  }

  static validateProviderConfig(): boolean {
    const provider = (process.env.CHANGELOG_AI_PROVIDER as AIProvider) || 'openai'

    switch (provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY
      case 'gemini':
        return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
      case 'ollama':
        return true // Ollama doesn't require credentials for local setup
      default:
        return false
    }
  }
}

export default AIProviderFactory
