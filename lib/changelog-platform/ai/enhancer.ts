import { generateText } from 'ai'
import AIProviderFactory from './provider'
import { getRuntimeAIConfig } from './settings'
import { EnhanceChangelogOutput, ChangelogTag } from '../types/changelog'

/**
 * AI Changelog Enhancer
 * Takes raw notes and generates professional changelog entries
 */

const ENHANCEMENT_PROMPT = `You are a professional changelog writer. Given raw notes about a software update, transform them into a well-structured changelog entry.

REQUIREMENTS:
1. Generate a catchy, concise title (max 50 chars)
2. Create markdown formatted content with sections: Features, Fixes, Improvements
3. Identify and return relevant tags from this list: Features, Fixes, Improvements, Breaking, Security, Performance, Docs
4. Use clear, professional language
5. Keep improvements brief but impactful

INPUT NOTES:
{rawNotes}

VERSION:
{version}

RESPOND IN JSON FORMAT ONLY:
{
  "title": "Short, catchy title",
  "content": "## Features\\n- Feature 1\\n\\n## Fixes\\n- Fix 1\\n\\n## Improvements\\n- Improvement 1",
  "tags": ["Features", "Fixes", "Improvements"]
}

Do not include any other text or markdown formatting outside the JSON.`

function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }
  return trimmed
}

function extractJSONObject(text: string): string {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1)
  }
  return text
}

function parseEnhancementResponse(text: string): { title: string; content: string; tags: unknown[] } {
  const direct = stripMarkdownCodeFence(text)

  try {
    return JSON.parse(direct)
  } catch {
    const extracted = extractJSONObject(direct)
    return JSON.parse(extracted)
  }
}

export async function enhanceChangelog(rawNotes: string, version?: string): Promise<EnhanceChangelogOutput> {
  try {
    const runtimeConfig = await getRuntimeAIConfig()
    const model = AIProviderFactory.getProvider(runtimeConfig)

    const prompt = ENHANCEMENT_PROMPT.replace('{rawNotes}', rawNotes).replace(
      /{version}/g,
      version || ''
    )

    const response = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    })

    // Parse JSON response (models sometimes wrap JSON in markdown fences)
    const parsed = parseEnhancementResponse(response.text)

    // Validate response
    if (!parsed.title || !parsed.content || !Array.isArray(parsed.tags)) {
      throw new Error('Invalid AI response format')
    }

    // Validate tags
    const validTags: ChangelogTag[] = ['Features', 'Fixes', 'Improvements', 'Breaking', 'Security', 'Performance', 'Docs']
    const tags = parsed.tags.filter(
      (tag: unknown): tag is ChangelogTag =>
        typeof tag === 'string' && validTags.includes(tag as ChangelogTag)
    )

    return {
      title: parsed.title.substring(0, 200),
      content: parsed.content,
      tags: tags.length > 0 ? tags : ['Features'],
    }
  } catch (error) {
    console.error('Error enhancing changelog:', error)
    throw new Error(`Failed to enhance changelog: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default enhanceChangelog
