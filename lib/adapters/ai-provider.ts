import type { AIProviderPort, AISettingsRepository } from '../core/ports'
import type { AIProviderKind } from '../core/constants'
import { AIProviderFactory } from '../changelog-platform/ai/provider'
import enhanceChangelog from '../changelog-platform/ai/enhancer'

export function createDefaultAIProviderPort(aiSettingsRepository: AISettingsRepository): AIProviderPort {
  return {
    async enhance(rawNotes: string, currentVersion?: string) {
      // Get settings from repository instead of direct DB access
      const settings = await aiSettingsRepository.get()
      const config = {
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.provider === 'openai' ? process.env.OPENAI_API_KEY : settings.provider === 'gemini' ? process.env.GOOGLE_GENERATIVE_AI_API_KEY : undefined,
        baseUrl: settings.ollamaBaseUrl || process.env.OLLAMA_BASE_URL,
      }
      
      return enhanceChangelog(rawNotes, currentVersion, config)
    },

    async listModels(input: { provider: AIProviderKind; ollamaBaseUrl?: string }) {
      // For listModels, we can use the input parameters directly
      // But we might want to fall back to stored settings if not provided
      let baseUrl = input.ollamaBaseUrl
      if (!baseUrl && input.provider === 'ollama') {
        const settings = await aiSettingsRepository.get()
        baseUrl = settings.ollamaBaseUrl
      }
      
      return AIProviderFactory.listModels({
        provider: input.provider,
        apiKey: undefined,
        baseUrl: baseUrl,
      })
    },
  }
}
