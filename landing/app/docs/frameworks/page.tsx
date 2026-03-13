'use client'

import { CodeBlock } from '../_components/CodeBlock'
import { useActiveSection } from '../_components/useActiveSection'

const SECTION_IDS = ['frameworks', 'nextjs', 'react', 'nuxt', 'vue', 'express'] as const

const NEXTJS_LAYOUT = `// app/changelog/layout.tsx
import 'changelog-sdk/styles'

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}`

const NEXTJS_PAGE = `// app/changelog/[[...route]]/page.tsx
import { Suspense } from 'react'
import { ChangelogManager } from 'changelog-sdk/next'

interface ChangelogPageProps {
  params: Promise<{ route?: string[] }>
  searchParams: Promise<{ page?: string; tags?: string; search?: string }>
}

export const metadata = {
  title: 'Changelog',
  description: 'View our latest updates and improvements',
}

export default function ChangelogPage(props: ChangelogPageProps) {
  return (
    <Suspense>
      <ChangelogPageContent {...props} />
    </Suspense>
  )
}

async function ChangelogPageContent({
  params,
  searchParams,
}: ChangelogPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  return (
    <ChangelogManager
      params={resolvedParams}
      searchParams={resolvedSearchParams}
    />
  )
}`

const NUXT_HANDLERS = `// server/api/changelog/feed.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getPublishedFeed

// server/api/changelog/entries/[slug].get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getEntryBySlug

// server/api/changelog/admin/entries.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getAdminFeed

// server/api/changelog/admin/entries/[id].get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getAdminEntryById

// server/api/changelog/admin/entries.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.createEntry

// server/api/changelog/admin/entries/[id].patch.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.updateEntry

// server/api/changelog/admin/entries/[id].delete.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.deleteEntry

// server/api/changelog/admin/login.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.login

// server/api/changelog/admin/register.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.register

// server/api/changelog/admin/can-register.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.canRegister

// server/api/changelog/admin/logout.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.logout

// server/api/changelog/admin/enhance.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.enhance

// server/api/changelog/admin/ai-settings.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getAISettings

// server/api/changelog/admin/ai-settings.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.updateAISettings

// server/api/changelog/admin/ai-models.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.listModels

// server/api/changelog/admin/changelog-settings.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getChangelogSettings

// server/api/changelog/admin/changelog-settings.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.updateChangelogSettings

// server/api/changelog/admin/latest-version.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getLatestPublishedVersion

// server/api/changelog/admin/repo-settings.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getRepoSettings

// server/api/changelog/admin/repo-settings.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.updateRepoSettings

// server/api/changelog/admin/repo-commits.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.previewRepoCommits

// server/api/changelog/admin/repo-generate.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.generateChangelogFromCommits`

const NUXT_OPTIONS = `// server/api/_changelog.ts (optional shared helper)
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
import { createMongooseChangelogRepository } from 'changelog-sdk/mongoose'

export const handlers = createNuxtChangelogHandlers({
  changelogRepository: createMongooseChangelogRepository(),
  allowAdminRegistration: false,
  sessionCookieName: 'changelog_admin_session',
})`

const NUXT_PAGE = `<!-- pages/changelog/[[...route]].vue -->
<script setup lang="ts">
import { ChangelogManager } from 'changelog-sdk/vue'
import 'changelog-sdk/styles'

const route = useRoute()
const params = {
  route: Array.isArray(route.params.route)
    ? route.params.route
    : [String(route.params.route || '')]
}
const searchParams = route.query as {
  page?: string
  tags?: string
  search?: string
}
</script>

<template>
  <ChangelogManager :params="params" :searchParams="searchParams" />
</template>`

const VUE3_INSTALL = `# Vue 3 app
bun add changelog-sdk vue-router
`

const VUE3_SETUP = `// main.ts or in your component
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'changelog-sdk/styles'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/changelog/:route(.*)*',
      component: () => import('./pages/Changelog.vue'),
    },
  ],
})`

const VUE3_COMPONENT = `<!-- pages/Changelog.vue -->
<script setup lang="ts">
import { ChangelogManager } from 'changelog-sdk/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const params = {
  route: Array.isArray(route.params.route)
    ? route.params.route
    : [String(route.params.route || '')]
}
const searchParams = route.query as {
  page?: string
  tags?: string
  search?: string
}
</script>

<template>
  <ChangelogManager
    :params="params"
    :searchParams="searchParams"
    apiBasePath="/api/changelog"
  />
</template>`

const VUE3_API_CONFIG = `<!-- pages/Changelog.vue -->
<ChangelogManager
  :params="params"
  :searchParams="searchParams"
  apiBasePath="/api/changelog"
  baseUrl="https://api.yoursite.com"
/>`

const REACT_SETUP = `// ChangelogRoute.tsx (React Router example)
import { ChangelogManager } from 'changelog-sdk/react'
import 'changelog-sdk/styles'
import { useParams, useSearchParams } from 'react-router-dom'

export default function ChangelogRoute() {
  const params = useParams()
  const [searchParams] = useSearchParams()

  const routeParam = params['*'] || ''
  const route = routeParam ? routeParam.split('/') : []

  const search = Object.fromEntries(searchParams.entries()) as {
    page?: string
    tags?: string
    search?: string
    preset?: string
  }

  return (
    <ChangelogManager
      params={{ route }}
      searchParams={search}
      basePath="/changelog"
      apiBasePath="/api/changelog"
    />
  )
}`

const EXPRESS_EXAMPLE = `// server.ts
import express from 'express'
import { createExpressChangelogRouter } from 'changelog-sdk/express'

const app = express()

app.use('/api/changelog', createExpressChangelogRouter())

app.listen(3000)`

const EXPRESS_OPTIONS = `import { createExpressChangelogRouter } from 'changelog-sdk/express'
import { createMongooseChangelogRepository } from 'changelog-sdk/mongoose'

app.use('/api/changelog', createExpressChangelogRouter({
  sessionCookieName: 'changelog_admin_session',
  allowAdminRegistration: false,
  changelogRepository: createMongooseChangelogRepository(),
  // sessionPort: custom session implementation
  // aiProvider: custom AI provider
}))`

export default function FrameworksPage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="frameworks" className="docs-section">
          <div className="docs-eyebrow">Framework Setup</div>
          <h1 className="docs-h1">Framework Setup</h1>
          <p className="docs-p">Full setup instructions for each supported framework.</p>
        </section>

        <section id="nextjs" className="docs-section">
          <h2 className="docs-h2">Next.js</h2>
          <h3 className="docs-h3">1. Add changelog layout</h3>
          <p className="docs-p">Create the layout file to load the SDK styles. This must be in the same directory as the catch-all route:</p>
          <CodeBlock filename="app/changelog/layout.tsx" code={NEXTJS_LAYOUT} />

          <h3 className="docs-h3">2. Add the catch-all route</h3>
          <p className="docs-p">
            Create the page file. <code className="docs-code-inline">ChangelogManager</code> handles all three views: public feed, login, and admin.
          </p>
          <CodeBlock filename="app/changelog/[[...route]]/page.tsx" code={NEXTJS_PAGE} />

          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>That&apos;s it for the Next.js adapter. Configure your env vars and run <code className="docs-code-inline">bun run dev</code>.</div>
          </div>
        </section>

        <section id="react" className="docs-section">
          <h2 className="docs-h2">React (Any Backend)</h2>
          <p className="docs-p">
            Use <code className="docs-code-inline">changelog-sdk/react</code> to render the same UI in any React app, backed by any REST API
            (Next, Nuxt, Express, or custom).
          </p>
          <h3 className="docs-h3">1. Install and wire a route</h3>
          <p className="docs-p">Pass <code className="docs-code-inline">params</code> and <code className="docs-code-inline">searchParams</code> from your router.</p>
          <CodeBlock filename="ChangelogRoute.tsx" code={REACT_SETUP} />
        </section>

        <section id="nuxt" className="docs-section">
          <h2 className="docs-h2">Nuxt 3</h2>
          <h3 className="docs-h3">1. Install peer dependencies</h3>
          <p className="docs-p">The Nuxt adapter requires <code className="docs-code-inline">h3</code> and <code className="docs-code-inline">vue</code>:</p>
          <CodeBlock code="bun add h3 vue" />

          <h3 className="docs-h3">2. Define server API routes</h3>
          <p className="docs-p">
            Wire each Nuxt server route to the corresponding handler from <code className="docs-code-inline">changelog-sdk/nuxt</code>.
            The Vue UI expects the REST API shown below, so keep these paths aligned with <code className="docs-code-inline">/api/changelog</code>.
          </p>
          <CodeBlock filename="server/api/changelog/*.ts" code={NUXT_HANDLERS} />

          <h3 className="docs-h3">3. Optional: customize repositories + session cookie</h3>
          <p className="docs-p">
            By default, the Nuxt adapter uses the Mongoose repositories and creates its own session cookie. You can override both:
          </p>
          <CodeBlock filename="server/api/_changelog.ts" code={NUXT_OPTIONS} />

          <h3 className="docs-h3">4. Render the Vue UI in your Nuxt page</h3>
          <p className="docs-p">Use the Vue 3 component that ships with the SDK. Extract route params from Nuxt&apos;s <code className="docs-code-inline">useRoute()</code>:</p>
          <CodeBlock filename="pages/changelog/[[...route]].vue" code={NUXT_PAGE} />
        </section>

        <section id="vue" className="docs-section">
          <h2 className="docs-h2">Vue 3</h2>
          <h3 className="docs-h3">1. Install the SDK + router</h3>
          <p className="docs-p">You&apos;ll need Vue Router and the SDK styles:</p>
          <CodeBlock code={VUE3_INSTALL} />

          <h3 className="docs-h3">2. Configure Vue Router</h3>
          <p className="docs-p">Register a catch-all route in your Vue Router setup to handle all changelog sub-paths:</p>
          <CodeBlock filename="main.ts" code={VUE3_SETUP} />

          <h3 className="docs-h3">3. Create the Changelog page component</h3>
          <p className="docs-p">Import <code className="docs-code-inline">ChangelogManager</code> from <code className="docs-code-inline">changelog-sdk/vue</code> and pass it the route params:</p>
          <CodeBlock filename="pages/Changelog.vue" code={VUE3_COMPONENT} />

          <h3 className="docs-h3">4. Point to your API (optional)</h3>
          <p className="docs-p">
            If your API is on a different domain, set <code className="docs-code-inline">baseUrl</code>. Use <code className="docs-code-inline">apiBasePath</code> if you mount
            the API anywhere other than <code className="docs-code-inline">/api/changelog</code>.
          </p>
          <CodeBlock filename="pages/Changelog.vue" code={VUE3_API_CONFIG} />

          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div>
              The Vue UI expects a backend API at <code className="docs-code-inline">/api/changelog</code>. Use the Nuxt adapter or your own Express server. Override with <code className="docs-code-inline">apiBasePath</code> and <code className="docs-code-inline">baseUrl</code>.
            </div>
          </div>
        </section>

        <section id="express" className="docs-section">
          <h2 className="docs-h2">Express</h2>
          <p className="docs-p">
            Use the Express adapter from <code className="docs-code-inline">changelog-sdk/express</code> to expose the same REST API used by the Vue UI.
          </p>
          <p className="docs-p">
            The Express adapter uses the same session cookie signing secret as Next/Nuxt. Make sure <code className="docs-code-inline">CHANGELOG_SESSION_SECRET</code> is set in your environment.
          </p>
          <p className="docs-p">
            Use the Express adapter to mount the full REST API at <code className="docs-code-inline">/api/changelog</code>.
          </p>
          <CodeBlock filename="server.ts" code={EXPRESS_EXAMPLE} />
          <CodeBlock filename="server.ts" code={EXPRESS_OPTIONS} />

          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div>
              The Express integration is headless — there are no pre-built UI components. Use <code className="docs-code-inline">changelog-sdk/vue</code> for the frontend or build your own UI using the API endpoints.
            </div>
          </div>
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'frameworks' ? ' active' : ''}`} onClick={() => scrollTo('frameworks')}>Overview</button>
        <button className={`toc-link${activeSection === 'nextjs' ? ' active' : ''}`} onClick={() => scrollTo('nextjs')}>Next.js</button>
        <button className={`toc-link${activeSection === 'react' ? ' active' : ''}`} onClick={() => scrollTo('react')}>React</button>
        <button className={`toc-link${activeSection === 'nuxt' ? ' active' : ''}`} onClick={() => scrollTo('nuxt')}>Nuxt 3</button>
        <button className={`toc-link${activeSection === 'vue' ? ' active' : ''}`} onClick={() => scrollTo('vue')}>Vue 3</button>
        <button className={`toc-link${activeSection === 'express' ? ' active' : ''}`} onClick={() => scrollTo('express')}>Express</button>
      </nav>
    </>
  )
}
