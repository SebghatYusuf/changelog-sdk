import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import connectDB, { disconnectDB } from '../../lib/changelog-platform/db/mongoose'
import { Changelog } from '../../lib/changelog-platform/db/models/Changelog'
import {
  createChangelog,
  fetchAdminChangelogs,
  fetchChangelogByPreviewToken,
  generateChangelogPreviewLink,
  loginAdmin,
  transitionChangelogWorkflow,
  updateChangelogSettings,
} from '../../lib/changelog-platform/actions/changelog-actions'
import { configureChangelogSDK } from '../../lib/changelog-platform/runtime/config'

describe('changelog server actions', () => {
  let mongo: MongoMemoryServer

  beforeAll(async () => {
    process.env.MONGOMS_DOWNLOAD_PROGRESS = process.env.MONGOMS_DOWNLOAD_PROGRESS || '0'
    process.env.MONGOMS_DOWNLOAD_DIR = process.env.MONGOMS_DOWNLOAD_DIR || `${process.cwd()}/.cache/mongodb-binaries`
    process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.24'
    process.env.MONGOMS_PREFER_GLOBAL_PATH = process.env.MONGOMS_PREFER_GLOBAL_PATH || '1'
    try {
      mongo = await MongoMemoryServer.create({
        binary: {
          version: process.env.MONGOMS_VERSION,
          downloadDir: process.env.MONGOMS_DOWNLOAD_DIR,
        },
        instance: {
          ip: '127.0.0.1',
        },
      })
    } catch (error) {
      throw new Error(
        'Mongo binary is not prepared. Run `bun run test:integration:prepare` once, then rerun integration tests.'
      )
    }
    process.env.CHANGELOG_MONGODB_URI = mongo.getUri()
    process.env.CHANGELOG_ADMIN_PASSWORD = 'admin-secret'
    process.env.CHANGELOG_PREVIEW_SECRET = 'preview-secret'
    configureChangelogSDK({ webhooks: [] })
  }, 120000)

  afterAll(async () => {
    await disconnectDB()
    if (mongo) {
      await mongo.stop()
    }
  })

  beforeEach(async () => {
    await connectDB()
    await Changelog.deleteMany({})
  })

  it('creates unique slug suffixes for same title', async () => {
    const first = await createChangelog({
      title: 'New Feature',
      content: 'Some content',
      version: '1.0.0',
      status: 'draft',
      workflowState: 'draft',
      tags: ['Features'],
    })
    const second = await createChangelog({
      title: 'New Feature',
      content: 'Different content',
      version: '1.0.1',
      status: 'draft',
      workflowState: 'draft',
      tags: ['Features'],
    })

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
    expect(first.data?.slug).toBe('new-feature')
    expect(second.data?.slug).toBe('new-feature-2')
  })

  it('enforces auth for workflow transitions', async () => {
    const created = await createChangelog({
      title: 'Needs Approval',
      content: 'Body',
      version: '1.2.0',
      status: 'draft',
      workflowState: 'draft',
      tags: ['Features'],
    })

    const unauthorized = await transitionChangelogWorkflow({
      id: created.data!._id,
      nextState: 'pending_approval',
    })
    expect(unauthorized.success).toBe(false)
    expect(unauthorized.error).toBe('Unauthorized')

    const login = await loginAdmin('admin-secret')
    expect(login.success).toBe(true)

    const authorized = await transitionChangelogWorkflow({
      id: created.data!._id,
      nextState: 'pending_approval',
    })
    expect(authorized.success).toBe(true)
    expect(authorized.data?.workflowState).toBe('pending_approval')
  })

  it('creates signed preview links and resolves preview entry', async () => {
    const login = await loginAdmin('admin-secret')
    expect(login.success).toBe(true)

    const created = await createChangelog({
      title: 'Draft Preview',
      content: 'Preview body',
      version: '2.0.0',
      status: 'draft',
      workflowState: 'draft',
      tags: ['Docs'],
    })

    const preview = await generateChangelogPreviewLink({ id: created.data!._id, expiresInHours: 1 }, { basePath: '/updates' })
    expect(preview.success).toBe(true)
    expect(preview.data?.url.startsWith('/updates/preview/')).toBe(true)

    const token = preview.data!.token
    const fetched = await fetchChangelogByPreviewToken(token)
    expect(fetched.data?._id).toBe(created.data!._id)
    expect(fetched.data?.status).toBe('draft')
  })

  it('persists settings and returns admin feed entries', async () => {
    const login = await loginAdmin('admin-secret')
    expect(login.success).toBe(true)

    const saveSettings = await updateChangelogSettings({ defaultFeedPageSize: 15, autoPublish: true })
    expect(saveSettings.success).toBe(true)

    await createChangelog({
      title: 'Auto publish sample',
      content: 'content',
      version: '3.0.0',
      status: 'draft',
      workflowState: 'draft',
      tags: ['Improvements'],
    })

    const admin = await fetchAdminChangelogs(1, 10)
    expect(admin.success).toBe(true)
    expect(admin.data?.entries.length).toBeGreaterThan(0)
  })
})
