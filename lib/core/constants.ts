export type AIProviderKind = 'openai' | 'gemini' | 'ollama'

export const DEFAULT_AI_MODELS: Record<AIProviderKind, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
  ollama: 'llama2',
}
