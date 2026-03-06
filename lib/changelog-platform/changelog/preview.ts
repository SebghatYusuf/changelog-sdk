import 'server-only'
import crypto from 'node:crypto'

interface PreviewTokenPayload {
  id: string
  exp: number
  v: number
}

function getPreviewSecret(): string {
  const secret = process.env.CHANGELOG_PREVIEW_SECRET || process.env.CHANGELOG_ADMIN_PASSWORD || ''
  if (!secret) {
    throw new Error('CHANGELOG_PREVIEW_SECRET (or CHANGELOG_ADMIN_PASSWORD) must be set to generate preview links')
  }
  return secret
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(input: string): string {
  return crypto.createHmac('sha256', getPreviewSecret()).update(input).digest('base64url')
}

export function generatePreviewToken(payload: PreviewTokenPayload): string {
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyPreviewToken(token: string): PreviewTokenPayload | null {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expected = sign(encodedPayload)
  if (signature !== expected) return null

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as PreviewTokenPayload
    if (!parsed.id || !parsed.exp || typeof parsed.v !== 'number') return null
    if (parsed.exp < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

