import type { Request, Response, NextFunction } from 'express'

export interface RateLimitOptions {
  windowMs?: number
  max?: number
  keyPrefix?: string
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000
  const max = options.max ?? 60
  const keyPrefix = options.keyPrefix ?? 'rl'
  const store = new Map<string, RateLimitEntry>()

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    const key = `${keyPrefix}:${ip}`
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count += 1
    if (entry.count > max) {
      res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' })
      return
    }

    next()
  }
}
