import { parseEnvBoolean } from './env'

const loggedScopes = new Set<string>()

function isEnvLoggingEnabled(): boolean {
  const enabled =
    parseEnvBoolean(process.env.CHANGELOG_LOG_ENV) ||
    parseEnvBoolean(process.env.CHANGELOG_DEBUG)
  return Boolean(enabled)
}

function formatEnvValue(value: string | undefined): string {
  if (value === undefined || value === '') return '(unset)'
  return value
}

export function logEnvOnce(
  scope: string,
  entries: Record<string, string | undefined>,
  extra?: Record<string, unknown>
) {
  if (!isEnvLoggingEnabled()) return
  if (loggedScopes.has(scope)) return
  loggedScopes.add(scope)

  const snapshot: Record<string, string> = {}
  for (const [key, value] of Object.entries(entries)) {
    snapshot[key] = formatEnvValue(value)
  }

  const payload = extra ? { env: snapshot, ...extra } : { env: snapshot }
  console.info(`[changelog-sdk][env] ${scope}`, payload)
}
