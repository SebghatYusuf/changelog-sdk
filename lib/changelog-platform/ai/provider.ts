import { LanguageModel } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOllama } from 'ollama-ai-provider-v2'

/**
 * AI Provider Factory
 * Supports OpenAI, Google Gemini, and Ollama
 */

export type AIProvider = 'openai' | 'gemini' | 'ollama'

interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  baseUrl?: string
  model?: string
}

export class AIProviderFactory {
  static getProvider(config?: AIProviderConfig): LanguageModel {
    const provider = config?.provider || (process.env.CHANGELOG_AI_PROVIDER as AIProvider) || 'openai'

    switch (provider) {
      case 'openai':
        return this.getOpenAIProvider()

      case 'gemini':
        return this.getGeminiProvider()

      case 'ollama':
        return this.getOllamaProvider(config?.baseUrl)

      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  private static getOpenAIProvider(): LanguageModel {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not defined')
    }

    const openai = createOpenAI({
      apiKey,
    })

    return openai('gpt-4o-mini')
  }

  private static getGeminiProvider(): LanguageModel {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not defined')
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    })

    return google('gemini-2.5-flash')
  }

  private static getOllamaProvider(baseUrl?: string): LanguageModel {
    const ollamaBaseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

    const ollama = createOllama({
      baseURL: ollamaBaseUrl,
    })

    return ollama('llama2')
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
