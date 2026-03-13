import type { Request, Response, NextFunction } from 'express'

export interface SecurityHeadersOptions {
  enabled?: boolean
}

export function securityHeaders(options: SecurityHeadersOptions = {}) {
  if (options.enabled === false) {
    return (_req: Request, _res: Response, next: NextFunction) => next()
  }

  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'same-origin')
    next()
  }
}
