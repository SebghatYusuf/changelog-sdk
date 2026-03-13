import { parseEnvBoolean } from './env'

const loggedScopes = new Set<string>()

export function isLogEnabled(): boolean {
  const enabled =
    parseEnvBoolean(process.env.CHANGELOG_LOG_ENV) ||
    parseEnvBoolean(process.env.CHANGELOG_DEBUG)
  return Boolean(enabled)
}

function formatEnvValue(value: string | undefined): string {
  if (value === undefined || value === '') return '(unset)'
  return value
}

export function summarizeSecret(value: string | undefined): string {
  if (!value || value.length === 0) return '(unset)'
  return `(set:${value.length})`
}

export function sanitizeMongoUri(value: string | undefined): string {
  if (!value) return '(unset)'
  try {
    const url = new URL(value)
    if (url.username || url.password) {
      url.username = url.username ? '***' : ''
      url.password = url.password ? '***' : ''
    }
    return url.toString()
  } catch {
    return value.replace(/\/\/([^:@/]+)(:([^@/]*))?@/g, '//***:***@')
  }
}

function redactValue(key: string, value: unknown): unknown {
  const lower = key.toLowerCase()
  if (
    lower.includes('password') ||
    lower.includes('secret') ||
    lower.includes('token') ||
    lower.includes('api_key') ||
    lower.includes('apikey') ||
    lower.includes('authorization')
  ) {
    if (typeof value === 'string') return `(redacted:${value.length})`
    return '(redacted)'
  }
  return value
}

export function sanitizePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item))
  }
  const record = payload as Record<string, unknown>
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) {
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizePayload(value)
    } else {
      sanitized[key] = redactValue(key, value)
    }
  }
  return sanitized
}

export function logEnvOnce(
  scope: string,
  entries: Record<string, string | undefined>,
  extra?: Record<string, unknown>
) {
  if (!isLogEnabled()) return
  if (loggedScopes.has(scope)) return
  loggedScopes.add(scope)

  const snapshot: Record<string, string> = {}
  for (const [key, value] of Object.entries(entries)) {
    snapshot[key] = formatEnvValue(value)
  }

  const payload = extra ? { env: snapshot, ...extra } : { env: snapshot }
  console.info(`[changelog-sdk][env] ${scope}`, payload)
}

export function logApiRequest(scope: string, data: Record<string, unknown>) {
  if (!isLogEnabled()) return
  console.info(`[changelog-sdk][api] ${scope}`, data)
}
