import { generateObject, generateText } from 'ai'
import { z } from 'zod'
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

const EnhancementResponseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }
  return trimmed
}

function extractFencedBlocks(text: string): string[] {
  const blocks: string[] = []
  const regex = /```(?:json)?\s*([\s\S]*?)\s*```/gi

  let match: RegExpExecArray | null
  do {
    match = regex.exec(text)
    if (match?.[1]) {
      blocks.push(match[1].trim())
    }
  } while (match)

  return blocks
}

function extractJSONObject(text: string): string {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1)
  }
  return text
}

function extractBalancedJSONObject(text: string): string | null {
  let depth = 0
  let inString = false
  let isEscaped = false
  let startIndex = -1

  for (let index = 0; index < text.length; index++) {
    const char = text[index]

    if (inString) {
      if (isEscaped) {
        isEscaped = false
      } else if (char === '\\') {
        isEscaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      if (depth === 0) {
        startIndex = index
      }
      depth += 1
      continue
    }

    if (char === '}') {
      if (depth > 0) {
        depth -= 1
        if (depth === 0 && startIndex >= 0) {
          return text.slice(startIndex, index + 1)
        }
      }
    }
  }

  return null
}

function sanitizeJSONCandidate(text: string): string {
  let sanitized = text.trim()

  sanitized = sanitized
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^```(?:json)?\s*$/gim, '')
    .replace(/^\s*```\s*$/gim, '')
    .trim()

  return sanitized
}

function buildParseCandidates(text: string): string[] {
  const trimmed = text.trim()
  const direct = stripMarkdownCodeFence(trimmed)
  const fencedBlocks = extractFencedBlocks(trimmed)
  const broadExtracted = extractJSONObject(direct)

  const rawCandidates = [
    direct,
    ...fencedBlocks,
    extractBalancedJSONObject(direct),
    extractBalancedJSONObject(trimmed),
    broadExtracted,
  ].filter((candidate): candidate is string => Boolean(candidate && candidate.trim()))

  const candidates: string[] = []
  const seen = new Set<string>()

  const pushCandidate = (candidate: string | null) => {
    if (!candidate) return
    const normalized = candidate.trim()
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    candidates.push(normalized)
  }

  for (const candidate of rawCandidates) {
    const sanitized = sanitizeJSONCandidate(candidate)

    pushCandidate(candidate)
    pushCandidate(sanitized)
    pushCandidate(extractBalancedJSONObject(sanitized))
    pushCandidate(extractJSONObject(sanitized))
  }

  return candidates
}

function parseEnhancementResponse(text: string): { title: string; content: string; tags: unknown[] } {
  const candidates = buildParseCandidates(text)

  let lastError: unknown
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Invalid AI response format')
}

export async function enhanceChangelog(rawNotes: string, version?: string): Promise<EnhanceChangelogOutput> {
  try {
    const runtimeConfig = await getRuntimeAIConfig()
    const model = await AIProviderFactory.getProvider(runtimeConfig)

    const prompt = ENHANCEMENT_PROMPT.replace('{rawNotes}', rawNotes).replace(
      /{version}/g,
      version || ''
    )

    let parsed: { title: string; content: string; tags: unknown[] }

    try {
      const objectResponse = await generateObject({
        model,
        schema: EnhancementResponseSchema,
        prompt,
        temperature: 0.7,
      })

      parsed = {
        title: objectResponse.object.title,
        content: objectResponse.object.content,
        tags: objectResponse.object.tags,
      }
    } catch {
      const response = await generateText({
        model,
        prompt,
        temperature: 0.7,
        maxOutputTokens: 1000,
      })

      parsed = parseEnhancementResponse(response.text)
    }

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
