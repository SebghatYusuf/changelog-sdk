import express, { type Request, type RequestHandler, type Response, type Router } from 'express'
import { createChangelogService } from '../core'
import type {
  AdminUserRepository,
  AIProviderPort,
  AISettingsRepository,
  CacheInvalidationPort,
  ChangelogRepository,
  RepoProviderPort,
  RepoSettingsRepository,
  SessionPort,
  SettingsRepository,
} from '../core/ports'
import {
  createMongooseAdminUserRepository,
  createMongooseAISettingsRepository,
  createMongooseChangelogRepository,
  createMongooseRepoSettingsRepository,
  createMongooseSettingsRepository,
} from '../mongoose'
import { createDefaultAIProviderPort } from '../adapters/ai-provider'
import { createDefaultRepoProviderPort } from '../adapters/repo-provider'
import { createExpressSessionPort } from './session'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { csrfProtection, type CsrfOptions } from './csrf'
import { createRateLimiter, type RateLimitOptions } from './rate-limit'
import { securityHeaders, type SecurityHeadersOptions } from './security'
import { parseEnvBoolean } from '../core/env'

export interface ExpressAdapterOptions {
  changelogRepository?: ChangelogRepository
  settingsRepository?: SettingsRepository
  aiSettingsRepository?: AISettingsRepository
  adminUserRepository?: AdminUserRepository
  repoSettingsRepository?: RepoSettingsRepository
  allowAdminRegistration?: boolean
  sessionCookieName?: string
  sessionPort?: SessionPort
  createSessionPort?: (req: Request, res: Response) => SessionPort
  aiProvider?: AIProviderPort
  repoProvider?: RepoProviderPort
  cacheInvalidation?: CacheInvalidationPort
  csrf?: CsrfOptions
  rateLimit?: RateLimitOptions
  bodyLimit?: string | number
  securityHeaders?: SecurityHeadersOptions
}

export interface ExpressHandlers {
  getPublishedFeed: RequestHandler
  getEntryBySlug: RequestHandler
  getAdminFeed: RequestHandler
  getAdminEntryById: RequestHandler
  createEntry: RequestHandler
  updateEntry: RequestHandler
  deleteEntry: RequestHandler
  login: RequestHandler
  register: RequestHandler
  canRegister: RequestHandler
  logout: RequestHandler
  enhance: RequestHandler
  getAISettings: RequestHandler
  updateAISettings: RequestHandler
  listModels: RequestHandler
  getChangelogSettings: RequestHandler
  updateChangelogSettings: RequestHandler
  getLatestPublishedVersion: RequestHandler
  getRepoSettings: RequestHandler
  updateRepoSettings: RequestHandler
  previewRepoCommits: RequestHandler
  generateChangelogFromCommits: RequestHandler
}

interface ExpressAdapterResolvedDeps {
  changelogRepository: ChangelogRepository
  settingsRepository: SettingsRepository
  aiSettingsRepository: AISettingsRepository
  adminUserRepository: AdminUserRepository
  repoSettingsRepository: RepoSettingsRepository
  allowAdminRegistration: boolean
  aiProvider: AIProviderPort
  repoProvider: RepoProviderPort
  cacheInvalidation?: CacheInvalidationPort
  sessionCookieName: string
  sessionPort?: SessionPort
  createSessionPort?: (req: Request, res: Response) => SessionPort
}

function isRegistrationEnabledByEnv(): boolean {
  const direct = parseEnvBoolean(process.env['CHANGELOG_ALLOW_ADMIN_REGISTRATION'])
  if (direct !== undefined) return direct
  const fallback = parseEnvBoolean(
    process.env['PUBLIC_CHANGELOG_ALLOW_ADMIN_REGISTRATION']
  )
  return fallback ?? false
}

function resolveDeps(options: ExpressAdapterOptions): ExpressAdapterResolvedDeps {
  const aiSettingsRepository = options.aiSettingsRepository || createMongooseAISettingsRepository()
  const adminUserRepository = options.adminUserRepository || createMongooseAdminUserRepository()
  const repoSettingsRepository = options.repoSettingsRepository || createMongooseRepoSettingsRepository()

  return {
    changelogRepository: options.changelogRepository || createMongooseChangelogRepository(),
    settingsRepository: options.settingsRepository || createMongooseSettingsRepository(),
    aiSettingsRepository,
    adminUserRepository,
    repoSettingsRepository,
    allowAdminRegistration: options.allowAdminRegistration ?? isRegistrationEnabledByEnv(),
    aiProvider: options.aiProvider || createDefaultAIProviderPort(aiSettingsRepository),
    repoProvider: options.repoProvider || createDefaultRepoProviderPort(),
    cacheInvalidation: options.cacheInvalidation,
    sessionCookieName: options.sessionCookieName || DEFAULT_SESSION_COOKIE,
    sessionPort: options.sessionPort,
    createSessionPort: options.createSessionPort,
  }
}

function getSessionPort(
  req: Request,
  res: Response,
  deps: ExpressAdapterResolvedDeps
): SessionPort {
  if (deps.sessionPort) return deps.sessionPort
  if (deps.createSessionPort) return deps.createSessionPort(req, res)
  return createExpressSessionPort(req, res, deps.sessionCookieName)
}

function createService(req: Request, res: Response, deps: ExpressAdapterResolvedDeps) {
  return createChangelogService({
    changelogRepository: deps.changelogRepository,
    settingsRepository: deps.settingsRepository,
    aiSettingsRepository: deps.aiSettingsRepository,
    adminUserRepository: deps.adminUserRepository,
    repoSettingsRepository: deps.repoSettingsRepository,
    allowAdminRegistration: deps.allowAdminRegistration,
    session: getSessionPort(req, res, deps),
    aiProvider: deps.aiProvider,
    repoProvider: deps.repoProvider,
    cacheInvalidation: deps.cacheInvalidation,
  })
}

function parseNumber(value: unknown, fallback: number): number {
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function parseTags(value: unknown): string[] | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  return undefined
}

export function createExpressChangelogHandlers(options: ExpressAdapterOptions = {}): ExpressHandlers {
  const deps = resolveDeps(options)

  return {
    async getPublishedFeed(req, res) {
      const service = createService(req, res, deps)
      const page = parseNumber(req.query.page, 1)
      const limit = parseNumber(req.query.limit, 10)
      const tags = parseTags(req.query.tags)
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      res.json(await service.getPublishedFeed(page, limit, tags, search))
    },

    async getEntryBySlug(req, res) {
      const service = createService(req, res, deps)
      const slug = req.params.slug
      if (!slug) {
        res.json({ error: 'Changelog not found' })
        return
      }
      res.json(await service.getEntryBySlug(slug))
    },

    async getAdminFeed(req, res) {
      const service = createService(req, res, deps)
      const page = parseNumber(req.query.page, 1)
      const limit = parseNumber(req.query.limit, 20)
      res.json(await service.getAdminFeed(page, limit))
    },

    async getAdminEntryById(req, res) {
      const service = createService(req, res, deps)
      const id = req.params.id
      if (!id) {
        res.json({ success: false, error: 'Changelog entry not found' })
        return
      }
      res.json(await service.getAdminEntryById(id))
    },

    async createEntry(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.createEntry(req.body))
    },

    async updateEntry(req, res) {
      const service = createService(req, res, deps)
      const id = req.params.id
      const body = { ...(req.body || {}), id }
      res.json(await service.updateEntry(body))
    },

    async deleteEntry(req, res) {
      const service = createService(req, res, deps)
      const id = req.params.id
      if (!id) {
        res.json({ success: false, error: 'Changelog entry not found' })
        return
      }
      res.json(await service.deleteEntry(id))
    },

    async login(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.loginAdmin(req.body))
    },

    async register(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.registerAdmin(req.body))
    },

    async canRegister(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.canRegisterAdmin())
    },

    async logout(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.logoutAdmin())
    },

    async enhance(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.enhanceWithAI(req.body))
    },

    async getAISettings(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.getAISettings())
    },

    async updateAISettings(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.updateAISettings(req.body))
    },

    async listModels(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.listProviderModels(req.body))
    },

    async getChangelogSettings(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.getChangelogSettings())
    },

    async updateChangelogSettings(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.updateChangelogSettings(req.body))
    },

    async getLatestPublishedVersion(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.getLatestPublishedVersion())
    },

    async getRepoSettings(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.getRepoSettings())
    },

    async updateRepoSettings(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.updateRepoSettings(req.body))
    },

    async previewRepoCommits(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.previewRepoCommits(req.body))
    },

    async generateChangelogFromCommits(req, res) {
      const service = createService(req, res, deps)
      res.json(await service.generateChangelogFromCommits(req.body))
    },
  }
}

export function createExpressChangelogRouter(options: ExpressAdapterOptions = {}): Router {
  const router = express.Router()
  const bodyLimit = options.bodyLimit ?? '1mb'
  router.use(securityHeaders(options.securityHeaders))
  router.use(express.json({ limit: bodyLimit }))
  router.use(express.urlencoded({ limit: bodyLimit, extended: false }))
  router.use(csrfProtection(options.csrf))

  const loginLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 10,
    keyPrefix: 'changelog:login',
    ...(options.rateLimit || {}),
  })

  const handlers = createExpressChangelogHandlers(options)

  router.get('/feed', handlers.getPublishedFeed)
  router.get('/entries/:slug', handlers.getEntryBySlug)

  router.get('/admin/entries', handlers.getAdminFeed)
  router.get('/admin/entries/:id', handlers.getAdminEntryById)
  router.post('/admin/entries', handlers.createEntry)
  router.patch('/admin/entries/:id', handlers.updateEntry)
  router.delete('/admin/entries/:id', handlers.deleteEntry)

  router.post('/admin/login', loginLimiter, handlers.login)
  router.post('/admin/register', loginLimiter, handlers.register)
  router.get('/admin/can-register', handlers.canRegister)
  router.post('/admin/logout', handlers.logout)

  router.post('/admin/enhance', handlers.enhance)

  router.get('/admin/ai-settings', handlers.getAISettings)
  router.post('/admin/ai-settings', handlers.updateAISettings)
  router.post('/admin/ai-models', handlers.listModels)

  router.get('/admin/changelog-settings', handlers.getChangelogSettings)
  router.post('/admin/changelog-settings', handlers.updateChangelogSettings)
  router.get('/admin/latest-version', handlers.getLatestPublishedVersion)

  router.get('/admin/repo-settings', handlers.getRepoSettings)
  router.post('/admin/repo-settings', handlers.updateRepoSettings)
  router.post('/admin/repo-commits', handlers.previewRepoCommits)
  router.post('/admin/repo-generate', handlers.generateChangelogFromCommits)

  return router
}
