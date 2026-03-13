'use client'

import { CodeBlock } from '../../_components/CodeBlock'
import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = [
  'framework-apis',
  'nextjs-actions',
  'nextjs-crud',
  'nextjs-ai',
  'nextjs-repo',
  'nuxt-handlers',
  'vue-client',
  'express-core',
] as const

const NUXT_ROUTES = `// server/api/changelog/feed.get.ts
export default handlers.getPublishedFeed

// server/api/changelog/entries/[slug].get.ts
export default handlers.getEntryBySlug

// server/api/changelog/admin/entries.get.ts
export default handlers.getAdminFeed

// server/api/changelog/admin/entries/[id].get.ts
export default handlers.getAdminEntryById

// server/api/changelog/admin/entries.post.ts
export default handlers.createEntry

// server/api/changelog/admin/entries/[id].patch.ts
export default handlers.updateEntry

// server/api/changelog/admin/entries/[id].delete.ts
export default handlers.deleteEntry

// server/api/changelog/admin/login.post.ts
export default handlers.login

// server/api/changelog/admin/register.post.ts
export default handlers.register

// server/api/changelog/admin/can-register.get.ts
export default handlers.canRegister

// server/api/changelog/admin/logout.post.ts
export default handlers.logout

// server/api/changelog/admin/enhance.post.ts
export default handlers.enhance

// server/api/changelog/admin/ai-settings.get.ts
export default handlers.getAISettings

// server/api/changelog/admin/ai-settings.post.ts
export default handlers.updateAISettings

// server/api/changelog/admin/ai-models.post.ts
export default handlers.listModels

// server/api/changelog/admin/changelog-settings.get.ts
export default handlers.getChangelogSettings

// server/api/changelog/admin/changelog-settings.post.ts
export default handlers.updateChangelogSettings

// server/api/changelog/admin/latest-version.get.ts
export default handlers.getLatestPublishedVersion

// server/api/changelog/admin/repo-settings.get.ts
export default handlers.getRepoSettings

// server/api/changelog/admin/repo-settings.post.ts
export default handlers.updateRepoSettings

// server/api/changelog/admin/repo-commits.post.ts
export default handlers.previewRepoCommits

// server/api/changelog/admin/repo-generate.post.ts
export default handlers.generateChangelogFromCommits`

const NUXT_SETUP = `import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
export const handlers = createNuxtChangelogHandlers()`

const VUE_MANAGER_PROPS = `import { ChangelogManager } from 'changelog-sdk/vue'

<ChangelogManager
  :params="{ route: ['admin'] }"
  :searchParams="{ page: '1', tags: 'Features' }"
  apiBasePath="/api/changelog"
  baseUrl=""
/>`

const VUE_API_EXAMPLE = `import { createChangelogApi } from 'changelog-sdk/vue'

const api = createChangelogApi({ baseUrl: '', apiBasePath: '/api/changelog' })

await api.getFeed({ page: 1 })
await api.getEntryBySlug('v1-2-0')
await api.login({ email, password })
await api.createEntry({ title, content, version, status, tags })`

const EXPRESS_SERVICE = `import { createChangelogService } from 'changelog-sdk/core'
import {
  createMongooseChangelogRepository,
  createMongooseSettingsRepository,
  createMongooseAISettingsRepository,
  createMongooseAdminUserRepository,
  createMongooseRepoSettingsRepository,
} from 'changelog-sdk/mongoose'

const session = {
  async setAdminSession() {},
  async clearAdminSession() {},
  async hasAdminSession() {
    return false
  },
}

const aiProvider = {
  async enhance() {
    return { title: '', content: '', tags: [], version: '' }
  },
  async listModels() {
    return []
  },
}

const service = createChangelogService({
  changelogRepository: createMongooseChangelogRepository(),
  settingsRepository: createMongooseSettingsRepository(),
  aiSettingsRepository: createMongooseAISettingsRepository(),
  adminUserRepository: createMongooseAdminUserRepository(),
  repoSettingsRepository: createMongooseRepoSettingsRepository(),
  session,
  aiProvider,
})

await service.getPublishedFeed(1, 10)
await service.createEntry(input)
await service.loginAdmin({ email, password })`

export default function ServerActionsPage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="framework-apis" className="docs-section">
          <div className="docs-eyebrow">API Reference</div>
          <h1 className="docs-h1">Framework APIs</h1>
          <p className="docs-p">
            The SDK ships framework-specific APIs for Next.js, Nuxt 3, Vue 3, and Express. Use the section that matches your stack.
          </p>
        </section>

        <section id="nextjs-actions" className="docs-section">
          <h2 className="docs-h2">Next.js Server Actions</h2>
          <p className="docs-p">All server actions are imported from <code className="docs-code-inline">changelog-sdk/next</code>. They are fully typed and Zod-validated.</p>
        </section>

        <section id="nextjs-crud" className="docs-section">
          <h3 className="docs-h3">Core CRUD</h3>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">createChangelog(input)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Create a new changelog entry. Returns the created entry or an error.</p>
              <CodeBlock code={`import { createChangelog } from 'changelog-sdk/next'

const result = await createChangelog({
  title: 'v1.2.0 Released',
  content: '## Features\\n- New feature\\n\\n## Fixes\\n- Bug fix',
  version: '1.2.0',
  status: 'published',
  tags: ['Features', 'Fixes'],
})`} />
            </div>
          </div>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">fetchPublishedChangelogs(page, limit, tags?, search?)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Fetch paginated published entries with optional tag and search filtering.</p>
              <CodeBlock code={`import { fetchPublishedChangelogs } from 'changelog-sdk/next'

const result = await fetchPublishedChangelogs(
  1,       // page
  10,      // limit
  ['Features', 'Fixes'], // tags filter (optional)
  'dark mode'            // search query (optional)
)`} />
            </div>
          </div>
        </section>

        <section id="nextjs-ai" className="docs-section">
          <h3 className="docs-h3">AI Enhancement</h3>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">runAIEnhance(input)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Enhance raw release notes into a polished changelog entry using the configured AI provider.</p>
              <CodeBlock code={`import { runAIEnhance } from 'changelog-sdk/next'

const result = await runAIEnhance({
  rawNotes: 'Fixed auth bug, added dark mode, improved performance',
  currentVersion: '1.2.0',
})
// result: { title, content, tags, version }`} />
            </div>
          </div>
        </section>

        <section id="nextjs-repo" className="docs-section">
          <h3 className="docs-h3">Repository Commits</h3>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">generateChangelogFromCommits(input)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Generate a draft changelog from repository commits in a date range.</p>
              <CodeBlock code={`import { generateChangelogFromCommits } from 'changelog-sdk/next'

const result = await generateChangelogFromCommits({
  since: '2025-01-01',
  until: '2025-01-07',
  limit: 50,
})`} />
            </div>
          </div>
        </section>

        <section id="nuxt-handlers" className="docs-section">
          <h2 className="docs-h2">Nuxt 3 Handlers</h2>
          <p className="docs-p">Nuxt uses Nitro event handlers exported from <code className="docs-code-inline">changelog-sdk/nuxt</code>. Build the REST API that the Vue UI expects.</p>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">setup</span>
              <span className="api-fn-name">createNuxtChangelogHandlers()</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={NUXT_SETUP} />
            </div>
          </div>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">routes</span>
              <span className="api-fn-name">/api/changelog/*</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={NUXT_ROUTES} />
            </div>
          </div>
        </section>

        <section id="vue-client" className="docs-section">
          <h2 className="docs-h2">Vue 3 Client API</h2>
          <p className="docs-p">
            Vue ships with a full UI and a headless REST client. Import the UI from <code className="docs-code-inline">changelog-sdk/vue</code>
            and point it at your Nuxt or Express API.
          </p>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">component</span>
              <span className="api-fn-name">ChangelogManager</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={VUE_MANAGER_PROPS} />
            </div>
          </div>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">client</span>
              <span className="api-fn-name">createChangelogApi()</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={VUE_API_EXAMPLE} />
            </div>
          </div>
        </section>

        <section id="express-core" className="docs-section">
          <h2 className="docs-h2">Express / Core Service</h2>
          <p className="docs-p">
            Express apps should use the framework-agnostic core service. Provide repositories, session handling, and an AI provider.
          </p>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">service</span>
              <span className="api-fn-name">createChangelogService()</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={EXPRESS_SERVICE} />
            </div>
          </div>
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'framework-apis' ? ' active' : ''}`} onClick={() => scrollTo('framework-apis')}>Overview</button>
        <button className={`toc-link${activeSection === 'nextjs-actions' ? ' active' : ''}`} onClick={() => scrollTo('nextjs-actions')}>Next.js Actions</button>
        <button className={`toc-link${activeSection === 'nextjs-crud' ? ' active' : ''}`} onClick={() => scrollTo('nextjs-crud')}>Core CRUD</button>
        <button className={`toc-link${activeSection === 'nextjs-ai' ? ' active' : ''}`} onClick={() => scrollTo('nextjs-ai')}>AI Enhancement</button>
        <button className={`toc-link${activeSection === 'nextjs-repo' ? ' active' : ''}`} onClick={() => scrollTo('nextjs-repo')}>Repository Commits</button>
        <button className={`toc-link${activeSection === 'nuxt-handlers' ? ' active' : ''}`} onClick={() => scrollTo('nuxt-handlers')}>Nuxt Handlers</button>
        <button className={`toc-link${activeSection === 'vue-client' ? ' active' : ''}`} onClick={() => scrollTo('vue-client')}>Vue Client API</button>
        <button className={`toc-link${activeSection === 'express-core' ? ' active' : ''}`} onClick={() => scrollTo('express-core')}>Express Core</button>
      </nav>
    </>
  )
}
