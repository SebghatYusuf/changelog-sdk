import 'server-only'

export interface SDKLogger {
  debug: (message: string, meta?: Record<string, unknown>) => void
  info: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
}

export type ChangelogEventName =
  | 'entry.created'
  | 'entry.updated'
  | 'entry.published'
  | 'entry.scheduled'
  | 'entry.approved'
  | 'entry.deleted'
  | 'entry.preview_link_created'
  | 'error'

export interface ChangelogEvent<TPayload = Record<string, unknown>> {
  type: ChangelogEventName
  timestamp: string
  payload: TPayload
}

export interface WebhookTarget {
  url: string
  secret: string
  events?: ChangelogEventName[]
  timeoutMs?: number
  retries?: number
  headers?: Record<string, string>
}

export interface ChangelogSDKConfig {
  logger?: Partial<SDKLogger>
  onError?: (error: unknown, context?: Record<string, unknown>) => void | Promise<void>
  webhooks?: WebhookTarget[]
}

const defaultLogger: SDKLogger = {
  debug: (message, meta) => console.debug(message, meta || {}),
  info: (message, meta) => console.info(message, meta || {}),
  warn: (message, meta) => console.warn(message, meta || {}),
  error: (message, meta) => console.error(message, meta || {}),
}

let runtimeConfig: ChangelogSDKConfig = {}

export function configureChangelogSDK(config: ChangelogSDKConfig): void {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
    logger: {
      ...(runtimeConfig.logger || {}),
      ...(config.logger || {}),
    },
    webhooks: config.webhooks || runtimeConfig.webhooks || [],
  }
}

export function getSDKLogger(): SDKLogger {
  const logger = runtimeConfig.logger || {}
  return {
    debug: logger.debug || defaultLogger.debug,
    info: logger.info || defaultLogger.info,
    warn: logger.warn || defaultLogger.warn,
    error: logger.error || defaultLogger.error,
  }
}

export function getSDKConfig(): ChangelogSDKConfig {
  return runtimeConfig
}

