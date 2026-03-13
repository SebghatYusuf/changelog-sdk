<div align="center">
  <img src="https://raw.githubusercontent.com/SebghatYusuf/changelog-sdk/master/images/changelog-sdk-icon.svg" alt="Changelog SDK Logo" width="128" height="128" />
  <h1>Changelog SDK</h1>
  <p><strong>AI-Powered Changelog Management</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16%2B-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19%2B-149eca)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178c6)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
</div>

<br />

Framework-agnostic changelog SDK with a headless core plus first-party adapters for Next.js, Nuxt, Vue 3, Express, and React.

`changelog-sdk` is designed for teams that want to ship updates faster while keeping changelog UX clean, searchable, and isolated from host app styles.

<div align="center">
  <img src="https://raw.githubusercontent.com/SebghatYusuf/changelog-sdk/master/site/images/changelog.png" alt="Public Changelog Feed" width="800" style="border-radius: 8px; border: 1px solid #e5e7eb;" />
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Why Changelog SDK](#why-changelog-sdk)
- [Features](#features)
- [Requirements](#requirements)
- [Quick Start (Next.js)](#quick-start-nextjs)
  - [1) Install the package](#1-install-the-package)
  - [2) Configure next.config.js (required)](#2-configure-nextconfigjs-required)
  - [3) Add changelog layout (required)](#3-add-changelog-layout-required)
  - [4) Add the catch-all changelog route](#4-add-the-catch-all-changelog-route)
  - [5) Configure environment variables](#5-configure-environment-variables)
  - [6) Add auth middleware (optional)](#6-add-auth-middleware-optional)
  - [7) Run your app](#7-run-your-app)
- [Package Surfaces](#package-surfaces)
- [Nuxt Quick Start](#nuxt-quick-start)
  - [1) Install the package and peer dependencies](#1-install-the-package-and-peer-dependencies)
  - [2) Configure environment variables](#2-configure-environment-variables)
  - [3) Define server routes](#3-define-server-routes)
  - [4) Use the Vue UI](#4-use-the-vue-ui)
- [React Quick Start (Any Backend)](#react-quick-start-any-backend)
  - [1) Install the package](#1-install-the-package-1)
  - [2) Render the React UI](#2-render-the-react-ui)
- [Express Quick Start](#express-quick-start)
  - [1) Install the package](#1-install-the-package-2)
  - [2) Mount the router](#2-mount-the-router)
  - [3) CSRF header (custom clients)](#3-csrf-header-custom-clients)
- [Vue 3 Quick Start](#vue-3-quick-start)
  - [1) Install the package](#1-install-the-package-3)
  - [2) Import styles and components](#2-import-styles-and-components)
  - [3) Mount with route params](#3-mount-with-route-params)
  - [4) Configure the API base path](#4-configure-the-api-base-path)
  - [5) Use the headless API client directly](#5-use-the-headless-api-client-directly)
- [Routing](#routing)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Public Feed](#public-feed)
  - [Admin Portal](#admin-portal)
  - [AI Enhancement Workflow](#ai-enhancement-workflow)
  - [Repository to Changelog](#repository-to-changelog)
- [API and Server Actions](#api-and-server-actions)
  - [Changelog CRUD](#changelog-crud)
  - [AI enhancement](#ai-enhancement)
  - [Repository integration](#repository-integration)
  - [Authentication](#authentication)
  - [Settings](#settings)
- [Advanced: Custom Adapter](#advanced-custom-adapter)
  - [Next.js adapter](#nextjs-adapter)
  - [Nuxt adapter](#nuxt-adapter)
  - [Mongoose repositories](#mongoose-repositories)
- [TypeScript Types and Schemas](#typescript-types-and-schemas)
  - [Types](#types)
  - [Zod Schemas](#zod-schemas)
  - [Version utilities](#version-utilities)
  - [Default AI models](#default-ai-models)
- [Styling and CSS Isolation](#styling-and-css-isolation)
- [Security](#security)
  - [Session secret requirements](#session-secret-requirements)
- [Troubleshooting](#troubleshooting)
  - [Too many MongoDB connections](#too-many-mongodb-connections)
  - [Admin login fails](#admin-login-fails)
  - [AI enhancement fails](#ai-enhancement-fails)
  - [Unexpected host app styles](#unexpected-host-app-styles)
  - [TypeScript errors for `next` or `react` types](#typescript-errors-for-next-or-react-types)
- [Development (SDK Contributors)](#development-sdk-contributors)
- [Landing Page (GitHub Pages)](#landing-page-github-pages)
  - [Enable GitHub Pages](#enable-github-pages)
- [License](#license)

## Why Changelog SDK

- Core business logic is framework-agnostic and adapter-driven
- First-party Next.js app-router adapter with React Server Component UI
- First-party Nuxt/Nitro adapter (headless API handlers)
- React adapter for any backend (Next, Nuxt, Express, or custom REST)
- Vue 3 UI component library that pairs with the Nuxt adapter
- Express router adapter for the REST API
- Admin authentication with HTTP-only, HMAC-signed cookie sessions
- AI enhancement via OpenAI, Gemini, and Ollama
- Isolated `cl-` prefixed UI styles — no Tailwind required in host app
- Typed server actions and Zod-validated inputs throughout

## Features

- **Public changelog feed** at `/changelog` with search, filtering, and pagination
- **Admin portal** at `/changelog/admin` for creating, editing, and publishing entries
- **AI-powered writing assistance** — turn raw notes into polished release updates
- **Repository-to-changelog automation** — generate drafts from GitHub or Bitbucket commits
- **Secure auth flow** using MongoDB-backed admin users and signed cookie sessions
- **Type-safe API surface** with TypeScript and Zod schemas
- **Adapter architecture**: `core`, `next`, `mongoose`, `nuxt`, `react`, `vue`, and `express` package surfaces
- **Semver enforcement** — prevents publishing changelogs with a lower or duplicate version

## Requirements

- Node.js `>= 20`
- Next.js `>= 16` (for the Next.js adapter)
- React `>= 18` (for the React/Next adapters)
- MongoDB database

## Quick Start (Next.js)

### 1) Install the package

```bash
bun add changelog-sdk
# or
npm install changelog-sdk
```

**Optional: AI Enhancement**

Install one or more AI provider packages to enable AI-powered changelog writing:

```bash
# OpenAI (default model: gpt-4o-mini)
bun add ai @ai-sdk/openai

# Google Gemini (default model: gemini-2.5-flash)
bun add ai @ai-sdk/google

# Ollama — local inference (default model: llama2)
bun add ai ollama-ai-provider-v2
```

### 2) Configure next.config.js (required)

MongoDB and Mongoose must be treated as server-only external packages. Add the following to your `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongodb', 'mongoose'],
}

module.exports = nextConfig
```

### 3) Add changelog layout (required)

Create `app/changelog/layout.tsx`. This layout loads the SDK's isolated stylesheet and must wrap your changelog route:

```tsx
import 'changelog-sdk/styles'

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

### 4) Add the catch-all changelog route

Create `app/changelog/[[...route]]/page.tsx`:

```tsx
import { Suspense } from 'react'
import { ChangelogManager } from 'changelog-sdk/next'

interface ChangelogPageProps {
  params: Promise<{ route?: string[] }>
  searchParams: Promise<{ page?: string; tags?: string; search?: string; preset?: string }>
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

async function ChangelogPageContent({ params, searchParams }: ChangelogPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  return <ChangelogManager params={resolvedParams} searchParams={resolvedSearchParams} />
}
```

If your changelog is mounted under a nested route (for example `/members/changelog`), pass `basePath` so internal links and redirects stay scoped to that mount:

```tsx
return <ChangelogManager params={resolvedParams} searchParams={resolvedSearchParams} basePath="/members/changelog" />
```

### 5) Configure environment variables

Create `.env.local` in your project root:

```env
# MongoDB connection string
CHANGELOG_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/changelog?retryWrites=true&w=majority

# Create your first admin account with:
# bun run create:admin your-admin@email.com your-password "Admin"

# Optional: keep UI registration enabled
CHANGELOG_ALLOW_ADMIN_REGISTRATION=true

# Session signing secret — minimum 32 characters, required for secure sessions
CHANGELOG_SESSION_SECRET=your-random-secret-at-least-32-chars

# Encryption key for repository tokens (32 bytes, base64 or hex)
CHANGELOG_ENCRYPTION_KEY=base64:your-32-byte-key

# AI provider: openai | gemini | ollama
CHANGELOG_AI_PROVIDER=openai

# Provider API keys
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434

# Optional: AI rate limit (requests per minute, default: 10)
CHANGELOG_RATE_LIMIT=10
```

### 6) Add auth middleware (optional)

To protect `/changelog/admin` with server-side session verification, add `authMiddleware` to your `middleware.ts`:

```ts
// middleware.ts (at your project root)
import { authMiddleware } from 'changelog-sdk/next'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return authMiddleware(request, { basePath: '/changelog' })
}

export const config = {
  matcher: ['/changelog/:path*'],
}
```

The middleware redirects unauthenticated requests to `/changelog/login` automatically.

### 7) Run your app

```bash
bun run dev
# or
npm run dev
```

## Package Surfaces

| Import | Description |
|---|---|
| `changelog-sdk` or `changelog-sdk/core` | Framework-agnostic core service, ports, schemas, and types |
| `changelog-sdk/next` | Next.js server actions, middleware, and React UI components |
| `changelog-sdk/mongoose` | MongoDB repository implementations |
| `changelog-sdk/nuxt` | Nuxt/Nitro H3 event handlers (headless API) |
| `changelog-sdk/react` | React UI components + REST client for any backend |
| `changelog-sdk/vue` | Vue 3 UI components and headless API client |
| `changelog-sdk/express` | Express router + handlers for the REST API |
| `changelog-sdk/styles` | Isolated `cl-` prefixed CSS stylesheet |

## Nuxt Quick Start

### 1) Install the package and peer dependencies

```bash
bun add changelog-sdk h3 vue
# or
npm install changelog-sdk h3 vue
```

### 2) Configure environment variables

Create `.env` in your project root (same variables as the Next.js adapter):

```env
CHANGELOG_MONGODB_URI=mongodb+srv://...
CHANGELOG_SESSION_SECRET=your-random-secret-at-least-32-chars
CHANGELOG_ENCRYPTION_KEY=base64:your-32-byte-key
CHANGELOG_AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### 3) Define server routes

Wire handler functions to Nuxt server routes in `server/api/changelog/`:

```ts
// server/api/changelog/feed.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getPublishedFeed
```

```ts
// server/api/changelog/entries.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.createEntry
```

```ts
// server/api/changelog/entries/[id].patch.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.updateEntry
```

```ts
// server/api/changelog/entries/[id].delete.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.deleteEntry
```

```ts
// server/api/changelog/entries/[slug].get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getEntryBySlug
```

```ts
// server/api/changelog/admin/login.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.login
```

```ts
// server/api/changelog/admin/logout.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.logout
```

```ts
// server/api/changelog/admin/enhance.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.enhance
```

All handlers return the same response shapes as the Next.js server actions.

**Full list of available handlers:**

| Handler | Method | Description |
|---|---|---|
| `getPublishedFeed` | GET | Public paginated feed (query: `page`, `limit`, `tags`, `search`) |
| `getAdminFeed` | GET | Admin paginated feed (query: `page`, `limit`) |
| `getAdminEntryById` | GET | Fetch single entry by ID (param: `id`) |
| `getEntryBySlug` | GET | Fetch single entry by slug (param: `slug`) |
| `createEntry` | POST | Create a new entry |
| `updateEntry` | PATCH | Update an existing entry (body includes `id`) |
| `deleteEntry` | DELETE | Delete an entry (param: `id`) |
| `login` | POST | Admin login (body: `{ email, password }`) |
| `register` | POST | Create first admin account (body: `{ email, password, displayName? }`) |
| `canRegister` | GET | Returns whether initial admin registration is currently allowed |
| `logout` | POST | Admin logout |
| `enhance` | POST | AI enhancement (body: `{ rawNotes, currentVersion? }`) |
| `getAISettings` | GET | Fetch AI provider settings |
| `updateAISettings` | POST | Update AI provider settings |
| `listModels` | POST | List available models (body: `{ provider, ollamaBaseUrl? }`) |
| `getChangelogSettings` | GET | Fetch feed/publishing settings |
| `updateChangelogSettings` | POST | Update feed/publishing settings |
| `getLatestPublishedVersion` | GET | Get the latest published semver |

### 4) Use the Vue UI

Once the API is set up, mount `ChangelogManager` in a Vue page:

```ts
import { useRoute } from 'vue-router'
import { ChangelogManager } from 'changelog-sdk/vue'
import 'changelog-sdk/styles'

const route = useRoute()
const params = {
  route: Array.isArray(route.params.route)
    ? route.params.route
    : [String(route.params.route || '')]
}
const searchParams = route.query as { page?: string; tags?: string; search?: string }
```

```html
<template>
  <ChangelogManager :params="params" :searchParams="searchParams" />
</template>
```

## React Quick Start (Any Backend)

### 1) Install the package

```bash
bun add changelog-sdk
# or
npm install changelog-sdk
```

### 2) Render the React UI

```tsx
// ChangelogRoute.tsx (React Router example)
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
}
```

If your API lives on another domain, pass `baseUrl`.

## Express Quick Start

### 1) Install the package

```bash
bun add changelog-sdk express
# or
npm install changelog-sdk express
```

### 2) Mount the router

```ts
import express from 'express'
import { createExpressChangelogRouter } from 'changelog-sdk/express'

const app = express()
app.use('/api/changelog', createExpressChangelogRouter())
app.listen(3000)
```

### 3) CSRF header (custom clients)

The Express adapter enables CSRF protection by default. SDK clients send the header automatically. If you build your own client, read the `changelog-csrf` cookie and send it as `x-csrf-token` on `POST`, `PATCH`, `PUT`, and `DELETE` requests.

## Vue 3 Quick Start

### 1) Install the package

```bash
bun add changelog-sdk
# or
npm install changelog-sdk
```

### 2) Import styles and components

```ts
import 'changelog-sdk/styles'
import { ChangelogManager } from 'changelog-sdk/vue'
```

### 3) Mount with route params

```ts
import { useRoute } from 'vue-router'
import { ChangelogManager } from 'changelog-sdk/vue'

const route = useRoute()
const params = {
  route: Array.isArray(route.params.route)
    ? route.params.route
    : [String(route.params.route || '')]
}
const searchParams = route.query as { page?: string; tags?: string; search?: string }
```

```html
<template>
  <ChangelogManager :params="params" :searchParams="searchParams" />
</template>
```

### 4) Configure the API base path

By default the Vue UI calls `/api/changelog`. Override with:

```html
<ChangelogManager
  apiBasePath="/api/changelog"
  baseUrl="https://api.example.com"
/>
```

### 5) Use the headless API client directly

For custom UI, use `createChangelogApi` to interact with the backend:

```ts
import { createChangelogApi } from 'changelog-sdk/vue'

const api = createChangelogApi({ apiBasePath: '/api/changelog' })

const feed = await api.getFeed({ page: 1, limit: 10, tags: ['Features'] })
const entry = await api.getEntryBySlug('v1-2-0')
const enhanced = await api.enhance({ rawNotes: 'Fixed bugs, added dark mode', currentVersion: '1.2.0' })
```

## Routing

Once configured, the following routes are available out of the box:

| URL | Description |
|---|---|
| `/changelog` | Public changelog feed |
| `/changelog/<slug>` | Individual changelog detail |
| `/changelog/login` | Admin login |
| `/changelog/admin` | Admin dashboard — publishing |
| `/changelog/admin/ai` | Admin AI provider settings |
| `/changelog/admin/changelog-settings` | Admin feed and publishing defaults |
| `/changelog/admin/repo` | Admin repository settings |
| `/changelog/admin/presets` | Admin entry presets |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CHANGELOG_MONGODB_URI` | Yes | MongoDB connection string |
| `CHANGELOG_SESSION_SECRET` | Recommended | HMAC signing secret (min 32 chars). Falls back to `NEXTAUTH_SECRET` or `NUXT_SESSION_PASSWORD`. A missing or short secret degrades session security. |
| `CHANGELOG_ALLOW_ADMIN_REGISTRATION` | No | Set to `true` to allow creating admin accounts from `/changelog/login` even after the first admin exists |
| `CHANGELOG_ENCRYPTION_KEY` | Required for repo tokens | 32-byte key used to encrypt repository access tokens (prefix with `base64:` or `hex:`) |
| `CHANGELOG_AI_PROVIDER` | No | `openai`, `gemini`, or `ollama` |
| `OPENAI_API_KEY` | If OpenAI | API key for OpenAI |
| `GOOGLE_GENERATIVE_AI_API_KEY` | If Gemini | API key for Google Gemini |
| `OLLAMA_BASE_URL` | If Ollama | Base URL for local Ollama instance (e.g. `http://localhost:11434`) |
| `CHANGELOG_RATE_LIMIT` | No | AI calls per minute (default: `10`) |

## Usage

### Public Feed

- Browse published updates at `/changelog`
- Search by title or content
- Filter by tags: `Features`, `Fixes`, `Improvements`, `Breaking`, `Security`, `Performance`, `Docs`

![Public Changelog Feed](https://raw.githubusercontent.com/SebghatYusuf/changelog-sdk/master/site/images/changelog.png)

### Admin Portal

- Create your first admin account at `/changelog/login` (only when no admin exists yet)
- Log in at `/changelog/login` with email and password
- Publish and manage entries at `/changelog/admin`
- Configure AI settings at `/changelog/admin/ai`
- Adjust feed defaults at `/changelog/admin/changelog-settings`
- Connect repositories at `/changelog/admin/repo` to generate drafts from commits

![Admin — New Entry Form](https://raw.githubusercontent.com/SebghatYusuf/changelog-sdk/master/site/images/admin-new-entry.png)

Create your first admin user in MongoDB:

```bash
bun run create:admin your-admin@email.com your-password "Admin"
```

### AI Enhancement Workflow

1. Enter raw release notes in the admin form
2. Click **Enhance with AI**
3. Review the generated title, markdown body, and suggested tags
4. Edit as needed and publish

![AI Provider Settings](https://raw.githubusercontent.com/SebghatYusuf/changelog-sdk/master/site/images/ai-settings.png)

### Repository to Changelog

1. Add a GitHub repository URL or Bitbucket workspace/slug in `/changelog/admin/repo`
2. Provide an access token (stored encrypted in MongoDB)
3. Open **Generate from commits** in the editor to select a date range
4. Optionally enable AI polish for a standardized release-note format

**Token scopes**

- **GitHub**: use a fine-grained PAT or GitHub App token with **Contents: read** permission for the repository. Public repositories can be queried without authentication but are rate-limited.
- **Bitbucket Cloud**: use an API token with **read:repository:bitbucket** scope. App passwords are deprecated; new app passwords cannot be created after September 9, 2025 and existing ones stop working on June 9, 2026.

**Token setup references**

- GitHub commit API: [docs.github.com/en/rest/commits/commits](https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28)
- Bitbucket commits API: [developer.atlassian.com/cloud/bitbucket/rest/api-group-commits](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-commits/)
- Bitbucket API token scopes: [support.atlassian.com/bitbucket-cloud/docs/integrate-an-external-application](https://support.atlassian.com/bitbucket-cloud/docs/integrate-an-external-application-with-bitbucket-cloud/)
- Bitbucket app password deprecation: [support.atlassian.com/bitbucket-cloud/docs/app-passwords](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/)

## API and Server Actions

All server actions are exported from `changelog-sdk/next` and can be called from any Next.js Server Component, Route Handler, or other server action.

### Changelog CRUD

```ts
import {
  createChangelog,
  updateChangelog,
  deleteChangelog,
  fetchChangelogBySlug,
  fetchPublishedChangelogs,
  fetchAdminChangelogs,
  fetchAdminChangelogById,
  fetchLatestPublishedVersion,
} from 'changelog-sdk/next'

// Create
await createChangelog({
  title: 'v1.2.0 Released',
  content: '## Features\n- New feature\n\n## Fixes\n- Bug fix',
  version: '1.2.0',
  status: 'published',
  tags: ['Features', 'Fixes'],
})

// Update
await updateChangelog({ id: '...', title: 'Updated title', status: 'published' })

// Delete
await deleteChangelog('entry-id')

// Fetch by slug
const entry = await fetchChangelogBySlug('v1-2-0')

// Public feed (page, limit, tags, search)
const feed = await fetchPublishedChangelogs(1, 10, ['Features'], 'dark mode')

// Admin feed
const adminFeed = await fetchAdminChangelogs(1, 20)

// Admin entry by ID
const adminEntry = await fetchAdminChangelogById('entry-id')

// Latest published semver
const { data } = await fetchLatestPublishedVersion()
```

### AI enhancement

```ts
import { runAIEnhance } from 'changelog-sdk/next'

const result = await runAIEnhance({
  rawNotes: 'Fixed auth bug, added dark mode, improved performance',
  currentVersion: '1.2.0',
})
// result.data → { title, content, tags }
```

### Repository integration

```ts
import {
  fetchRepoSettings,
  updateRepoSettings,
  previewRepoCommits,
  generateChangelogFromCommits,
} from 'changelog-sdk/next'

await updateRepoSettings({
  provider: 'git',
  repoUrl: 'https://github.com/org/repo',
  branch: 'main',
  token: 'ghp_...',
  enabled: true,
})

const commits = await previewRepoCommits({ since: '2025-01-01', until: '2025-01-07', limit: 50 })
const draft = await generateChangelogFromCommits({ since: '2025-01-01', until: '2025-01-07', limit: 50 })
```

### Authentication

```ts
import { loginAdmin, registerAdmin, canRegisterAdmin, logoutAdmin, checkAdminAuth } from 'changelog-sdk/next'

const isAdmin = await checkAdminAuth()      // boolean
const canRegister = await canRegisterAdmin() // { success, data: { canRegister } }
await registerAdmin({ email: 'admin@example.com', password: 'strong-password', displayName: 'Admin' })
const result = await loginAdmin({ email: 'admin@example.com', password: 'strong-password' }) // { success, error? }
await logoutAdmin()
```

### Settings

```ts
import {
  fetchAISettings,
  updateAISettings,
  fetchAIProviderModels,
  fetchChangelogSettings,
  updateChangelogSettings,
} from 'changelog-sdk/next'

// AI settings
const aiSettings = await fetchAISettings()
await updateAISettings({ provider: 'openai', model: 'gpt-4o', openaiApiKey: 'sk-...' })

// List available models for a provider
const models = await fetchAIProviderModels({ provider: 'ollama', ollamaBaseUrl: 'http://localhost:11434' })

// Feed settings
const feedSettings = await fetchChangelogSettings()
await updateChangelogSettings({ defaultFeedPageSize: 20, autoPublish: false })
```

## Advanced: Custom Adapter

Both adapters accept optional dependency overrides for testing or custom infrastructure.

### Next.js adapter

```ts
import { createNextChangelogAdapter } from 'changelog-sdk/next'

const adapter = createNextChangelogAdapter({
  // Override any repository or port
  revalidatePathname: '/changelog',   // path passed to Next.js revalidatePath
  sessionCookieName: 'my-session',    // default: 'changelog-admin-session'
  // changelogRepository: myCustomRepo,
  // settingsRepository: myCustomRepo,
  // aiSettingsRepository: myCustomRepo,
})

// adapter.actions exposes all server action functions
const result = await adapter.actions.createChangelog({ ... })
```

### Nuxt adapter

```ts
import { createNuxtChangelogService } from 'changelog-sdk/nuxt'
import type { H3Event } from 'h3'

// Used inside a Nitro event handler
export default defineEventHandler(async (event: H3Event) => {
  const service = createNuxtChangelogService(event, {
    sessionCookieName: 'my-session',
    // changelogRepository: myCustomRepo,
  })
  return service.getPublishedFeed(1, 10)
})
```

### Mongoose repositories

If you need to build your own adapter, import the repository factories directly:

```ts
import {
  createMongooseChangelogRepository,
  createMongooseSettingsRepository,
  createMongooseAISettingsRepository,
} from 'changelog-sdk/mongoose'
```

## TypeScript Types and Schemas

### Types

```ts
import type {
  ChangelogEntry,
  ChangelogStatus,       // 'draft' | 'published'
  ChangelogTag,          // 'Features' | 'Fixes' | 'Improvements' | 'Breaking' | 'Security' | 'Performance' | 'Docs'
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  EnhanceChangelogOutput,
  FeedResponse,
  AISettingsInput,
  AIModelOption,
  AIProviderKind,        // 'openai' | 'gemini' | 'ollama'
  ChangelogSettingsInput,
  PersistedAISettings,
  PersistedChangelogSettings,
} from 'changelog-sdk/core'
```

### Zod Schemas

```ts
import {
  CreateChangelogSchema,
  UpdateChangelogSchema,
  EnhanceChangelogSchema,
  ChangelogEntrySchema,
  ChangelogTagEnum,
  ChangelogStatusEnum,
  AIProviderEnum,
  AISettingsSchema,
  ChangelogSettingsSchema,
  FeedFiltersSchema,
  LoginSchema,
} from 'changelog-sdk/core'
```

### Version utilities

```ts
import { normalizeSemver, parseSemver, compareSemver } from 'changelog-sdk/core'

normalizeSemver('v1.2.3')            // '1.2.3'
parseSemver('1.2.3')                 // [1, 2, 3]
compareSemver('1.3.0', '1.2.0')     // 1 (a > b)
```

### Default AI models

```ts
import { DEFAULT_AI_MODELS } from 'changelog-sdk/core'
// { openai: 'gpt-4o-mini', gemini: 'gemini-2.5-flash', ollama: 'llama2' }
```

## Styling and CSS Isolation

All internal classes are prefixed with `cl-` to avoid collisions with host app styles.

Available utility groups:

- **Typography:** `cl-h1`, `cl-h2`, `cl-h3`, `cl-h4`, `cl-p`, `cl-code`
- **Components:** `cl-card`, `cl-btn`, `cl-input`, `cl-textarea`, `cl-badge`, `cl-alert`
- **Layout:** `cl-container`, `cl-section`, `cl-grid`, `cl-grid-cols-1`, `cl-grid-cols-2`
- **Utilities:** `cl-transition`, `cl-truncate`, `cl-line-clamp-2`, `cl-line-clamp-3`

Avoid overriding `cl-` prefixed selectors globally in your host app.

## Security

- Markdown sanitization via `rehype-sanitize` and `DOMPurify`
- Zod validation on all inputs and server actions
- HTTP-only cookie sessions for admin auth with `sameSite: lax` and `secure` in production
- Admin session tokens are HMAC-SHA-256 signed with an expiry and a random nonce — not forgeable without the secret
- Session token signing uses the Web Crypto API (`crypto.subtle`) for compatibility across Edge, Node.js, and Nuxt runtimes
- A 5-second clock-skew tolerance is applied during token verification for distributed environments
- Bcrypt password hashing and verification (`bcryptjs`)
- Configurable AI request rate limiting
- Input sanitization and bounded pagination on all repository-touching service methods
- Repository access tokens are encrypted at rest with `CHANGELOG_ENCRYPTION_KEY` (AES-256-GCM)
- MongoDB search inputs are regex-escaped and length-limited before use in `$regex` queries
- Semver comparison prevents publishing lower or duplicate versions

### Session secret requirements

Set `CHANGELOG_SESSION_SECRET` to a random string of **at least 32 characters**:

```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The SDK also accepts `NEXTAUTH_SECRET` (Next.js) or `NUXT_SESSION_PASSWORD` (Nuxt) as fallbacks, subject to the same 32-character minimum.

## Troubleshooting

### Too many MongoDB connections

Add `serverExternalPackages: ['mongodb', 'mongoose']` to `next.config.js` (see [Quick Start step 2](#2-configure-nextconfigjs-required)). This prevents Next.js from bundling Mongoose, which would create duplicate connections per request.

### Admin login fails

1. Confirm at least one admin exists in the `admin_users` collection (`bun run create:admin ...`)
2. Confirm the login email and password are correct
3. Confirm `CHANGELOG_SESSION_SECRET` is set and at least 32 characters
4. If registration button is missing, set `CHANGELOG_ALLOW_ADMIN_REGISTRATION=true` (or create first admin via script)
5. Verify cookies are enabled in your browser
6. Clear existing cookies and retry

### AI enhancement fails

1. Confirm `CHANGELOG_AI_PROVIDER` is set to `openai`, `gemini`, or `ollama`
2. Verify the corresponding credential is present:
   - OpenAI → `OPENAI_API_KEY`
   - Gemini → `GOOGLE_GENERATIVE_AI_API_KEY`
   - Ollama → server running at `OLLAMA_BASE_URL`
3. Ensure the AI provider package is installed (e.g. `bun add ai @ai-sdk/openai`)

### Unexpected host app styles

Make sure you import `changelog-sdk/styles` inside the `app/changelog/layout.tsx` file and not in a global layout. Avoid `.cl-*` overrides in global CSS.

### TypeScript errors for `next` or `react` types

Confirm `next`, `react`, and `react-dom` are installed as devDependencies in your project. The SDK declares them as optional peer dependencies.

## Development (SDK Contributors)

Run commands from the repository root:

```bash
bun install
bun run build
bun run type-check
bun run example:install
bun run example:dev
```

| Script | Description |
|---|---|
| `bun run build` | Compile TypeScript and copy styles to `dist/` |
| `bun run type-check` | Run `tsc --noEmit` across the full codebase |
| `bun run example:install` | Install dependencies in the `example/` Next.js app |
| `bun run example:dev` | Start the example app dev server |
| `bun run example:build` | Build the example app |
| `bun run check:mongo` | Verify MongoDB connectivity |
| `bun run create:admin` | Create a MongoDB admin account |
| `bun run hash:password` | Generate a bcrypt hash interactively |

## Landing Page (GitHub Pages)

This repository includes a static landing page at `site/index.html` and a deployment workflow at `.github/workflows/deploy-pages.yml`.

### Enable GitHub Pages

1. Open your repository **Settings** → **Pages**
2. Under **Build and deployment**, choose **Source: GitHub Actions**
3. Push to the `main` branch

After deployment your landing page will be live at:

`https://<your-github-username>.github.io/changelog-sdk/`

## License

MIT
