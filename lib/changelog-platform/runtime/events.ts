import 'server-only'
import crypto from 'node:crypto'
import { ChangelogEvent, ChangelogEventName, getSDKConfig, getSDKLogger, WebhookTarget } from './config'

type EventHandler = (event: ChangelogEvent) => void | Promise<void>

const handlers = new Set<EventHandler>()

export function onChangelogEvent(handler: EventHandler): () => void {
  handlers.add(handler)
  return () => handlers.delete(handler)
}

function shouldDispatchToWebhook(webhook: WebhookTarget, eventType: ChangelogEventName): boolean {
  if (!webhook.events || webhook.events.length === 0) return true
  return webhook.events.includes(eventType)
}

function signPayload(secret: string, timestamp: string, body: string): string {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}

async function dispatchWebhook(event: ChangelogEvent, webhook: WebhookTarget): Promise<void> {
  const logger = getSDKLogger()
  const retries = Math.max(0, webhook.retries ?? 2)
  const timeoutMs = Math.max(1000, webhook.timeoutMs ?? 5000)
  const body = JSON.stringify(event)
  const timestamp = new Date().toISOString()
  const signature = signPayload(webhook.secret, timestamp, body)

  let attempt = 0
  while (attempt <= retries) {
    attempt += 1
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-changelog-sdk-signature': signature,
          'x-changelog-sdk-timestamp': timestamp,
          ...(webhook.headers || {}),
        },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`)
      }

      logger.debug('Webhook delivered', { eventType: event.type, url: webhook.url, attempt })
      return
    } catch (error) {
      if (attempt > retries) {
        logger.error('Webhook delivery failed', {
          eventType: event.type,
          url: webhook.url,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        })
        return
      }

      const delayMs = 200 * 2 ** (attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export async function emitChangelogEvent<TPayload extends Record<string, unknown>>(
  type: ChangelogEventName,
  payload: TPayload
): Promise<void> {
  const logger = getSDKLogger()
  const event: ChangelogEvent<TPayload> = {
    type,
    timestamp: new Date().toISOString(),
    payload,
  }

  for (const handler of handlers) {
    try {
      await handler(event)
    } catch (error) {
      logger.error('Event handler failed', {
        eventType: type,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const { webhooks } = getSDKConfig()
  if (!webhooks || webhooks.length === 0) return

  await Promise.all(
    webhooks
      .filter((webhook) => shouldDispatchToWebhook(webhook, type))
      .map((webhook) => dispatchWebhook(event, webhook))
  )
}

export async function reportSDKError(error: unknown, context?: Record<string, unknown>): Promise<void> {
  const logger = getSDKLogger()
  logger.error('Changelog SDK error', {
    ...(context || {}),
    error: error instanceof Error ? error.message : String(error),
  })

  const { onError } = getSDKConfig()
  if (onError) {
    try {
      await onError(error, context)
    } catch (onErrorError) {
      logger.error('SDK onError handler failed', {
        error: onErrorError instanceof Error ? onErrorError.message : String(onErrorError),
      })
    }
  }

  await emitChangelogEvent('error', {
    message: error instanceof Error ? error.message : String(error),
    ...(context || {}),
  })
}

