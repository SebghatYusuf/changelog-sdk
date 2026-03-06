import type { LanguageModel } from 'ai'
import { AIProvider, DEFAULT_AI_MODELS } from './constants'

/**
 * AI Provider Factory
 * Supports OpenAI, Google Gemini, and Ollama
 * Uses dynamic imports to only load installed AI providers
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
  private static normalizeOllamaBaseUrl(baseUrl?: string): string {
    const defaultBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const normalized = (baseUrl || defaultBaseUrl).replace(/\/$/, '')

    return normalized.endsWith('/api') ? normalized : `${normalized}/api`
  }

  static async getProvider(config?: AIProviderConfig): Promise<LanguageModel> {
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

  private static async getOpenAIProvider(apiKeyFromConfig?: string, modelFromConfig?: string): Promise<LanguageModel> {
    const apiKey = apiKeyFromConfig || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not defined')
    }

    try {
      const { createOpenAI } = await import('@ai-sdk/openai')
      const openai = createOpenAI({ apiKey })
      return openai(modelFromConfig || DEFAULT_AI_MODELS.openai)
    } catch (error) {
      throw new Error(
        'OpenAI SDK not installed. Install it with: npm install ai @ai-sdk/openai'
      )
    }
  }

  private static async getGeminiProvider(apiKeyFromConfig?: string, modelFromConfig?: string): Promise<LanguageModel> {
    const apiKey = apiKeyFromConfig || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not defined')
    }

    try {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
      const google = createGoogleGenerativeAI({ apiKey })
      return google(modelFromConfig || DEFAULT_AI_MODELS.gemini)
    } catch (error) {
      throw new Error(
        'Google Gemini SDK not installed. Install it with: npm install ai @ai-sdk/google'
      )
    }
  }

  private static async getOllamaProvider(baseUrl?: string, modelFromConfig?: string): Promise<LanguageModel> {
    const ollamaBaseUrl = this.normalizeOllamaBaseUrl(baseUrl)

    try {
      const { createOllama } = await import('ollama-ai-provider-v2')
      const ollama = createOllama({ baseURL: ollamaBaseUrl })
      return ollama(modelFromConfig || DEFAULT_AI_MODELS.ollama)
    } catch (error) {
      throw new Error(
        'Ollama SDK not installed. Install it with: npm install ai ollama-ai-provider-v2'
      )
    }
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
    const ollamaBaseUrl = this.normalizeOllamaBaseUrl(baseUrl)
    const response = await fetch(`${ollamaBaseUrl}/tags`)
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
