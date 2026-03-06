# Changelog SDK for Next.js (AI-Powered Changelog Management)

[![Next.js](https://img.shields.io/badge/Next.js-16%2B-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18%2B-149eca)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178c6)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Production-ready Changelog SDK for Next.js applications with a public changelog feed, secure admin portal, MongoDB persistence, and AI-assisted changelog writing.

`changelog-sdk` is designed for teams that want to ship updates faster while keeping changelog UX clean, searchable, and isolated from host app styles.

## Table of Contents

- [Why Changelog SDK](#why-changelog-sdk)
- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Routing Setup](#routing-setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API and Server Actions](#api-and-server-actions)
- [TypeScript Types](#typescript-types)
- [Styling and CSS Isolation](#styling-and-css-isolation)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Development (SDK Contributors)](#development-sdk-contributors)
- [License](#license)

## Why Changelog SDK

- Built for Next.js app router projects that need an integrated product changelog
- Includes admin authentication with HTTP-only cookie sessions
- Supports AI enhancement via OpenAI, Gemini, and Ollama
- Ships with isolated `cl-` prefixed UI styles to avoid global CSS conflicts
- Provides typed server actions and Zod-validated inputs

## Features

- **Public changelog feed** at `/changelog` with search, filtering, and pagination
- **Admin portal** at `/changelog/admin` for creating, editing, and deleting entries
- **AI-powered writing assistance** from raw notes to polished release updates
- **Secure auth flow** using hashed passwords and cookie-based sessions
- **Type-safe API surface** with TypeScript and Zod
- **Server Component friendly** architecture for modern Next.js apps
- **No Tailwind dependency in host app** for SDK styles

## Requirements

- Node.js `>= 20`
- Next.js `>= 15` (optimized for Next.js 16+)
- React `>= 18`
- MongoDB database

## Quick Start

### 1) Install the package

```bash
bun add github:SebghatYusuf/changelog-sdk#master
# or
npm install github:SebghatYusuf/changelog-sdk#master
# or
yarn add github:SebghatYusuf/changelog-sdk#master
# or
pnpm add github:SebghatYusuf/changelog-sdk#master
```

SDK styles are automatically included when importing from `changelog-sdk`.

### 2) Add the catch-all changelog route

Create `app/changelog/[[...route]]/page.tsx`:

```tsx
import { ChangelogManager } from 'changelog-sdk'

interface ChangelogPageProps {
  params: {
    route?: string[]
  }
}

export const metadata = {
  title: 'Changelog',
  description: 'View our latest updates and improvements',
}

export default function ChangelogPage({ params }: ChangelogPageProps) {
  return <ChangelogManager params={params} />
}
```

### 3) Configure environment variables

Create `.env.local` in your project root:

```env
# MongoDB
CHANGELOG_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/changelog?retryWrites=true&w=majority

# Admin password (bcryptjs hash only)
CHANGELOG_ADMIN_PASSWORD=$2a$10$...

# AI provider: openai | gemini | ollama
CHANGELOG_AI_PROVIDER=openai

# Provider keys
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434

# Optional
CHANGELOG_RATE_LIMIT=10
```

### 4) Run your app

```bash
bun run dev
# or
npm run dev
```

## Routing Setup

Once configured, these routes are available:

- `/changelog` → public timeline
- `/changelog/login` → admin login
- `/changelog/admin` → admin dashboard

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CHANGELOG_MONGODB_URI` | Yes | MongoDB connection string |
| `CHANGELOG_ADMIN_PASSWORD` | Yes | Bcrypt-hashed admin password |
| `CHANGELOG_AI_PROVIDER` | No | `openai`, `gemini`, or `ollama` |
| `OPENAI_API_KEY` | If OpenAI | API key for OpenAI provider |
| `GOOGLE_GENERATIVE_AI_API_KEY` | If Gemini | API key for Gemini provider |
| `OLLAMA_BASE_URL` | If Ollama | Base URL for local Ollama instance |
| `CHANGELOG_RATE_LIMIT` | No | AI calls per minute (default: `10`) |

## Usage

### Public Feed

- Browse published updates at `/changelog`
- Search by title/content
- Filter by tags: `Features`, `Fixes`, `Improvements`, `Breaking`, `Security`, `Performance`, `Docs`

### Admin Portal

- Log in at `/changelog/login`
- Manage entries at `/changelog/admin`

Generate a hashed password for `CHANGELOG_ADMIN_PASSWORD`:

```bash
bun -e "console.log(require('bcryptjs').hashSync('your-admin-password', 10))"
```

### AI Enhancement Workflow

1. Enter raw release notes
2. Click **Enhance with AI**
3. Review generated title, markdown body, and tags
4. Edit if needed and publish

## API and Server Actions

### Create changelog

```ts
import { createChangelog } from 'changelog-sdk'

const result = await createChangelog({
  title: 'v1.2.0 Released',
  content: '## Features\n- New feature\n\n## Fixes\n- Bug fix',
  version: '1.2.0',
  status: 'published',
  tags: ['Features', 'Fixes'],
})
```

### Fetch published changelogs

```ts
import { fetchPublishedChangelogs } from 'changelog-sdk'

const result = await fetchPublishedChangelogs(page, limit, tags, search)
```

### Run AI enhancement

```ts
import { runAIEnhance } from 'changelog-sdk'

const result = await runAIEnhance({
  rawNotes: 'Fixed auth bug, added dark mode, improved performance',
  currentVersion: '1.2.0',
})
```

### Authentication helpers

```ts
import { loginAdmin, logoutAdmin, checkAdminAuth } from 'changelog-sdk'

const isAdmin = await checkAdminAuth()
const loginResult = await loginAdmin('password')
await logoutAdmin()
```

## TypeScript Types

```ts
import type {
  ChangelogEntry,
  ChangelogStatus,
  ChangelogTag,
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  FeedResponse,
} from 'changelog-sdk'
```

## Styling and CSS Isolation

All internal classes are namespaced with `cl-` to minimize host-app style collisions.

Available utility groups:

- **Typography:** `cl-h1`, `cl-h2`, `cl-h3`, `cl-h4`, `cl-p`, `cl-code`
- **Components:** `cl-card`, `cl-btn`, `cl-input`, `cl-textarea`, `cl-badge`, `cl-alert`
- **Layout:** `cl-container`, `cl-section`, `cl-grid`, `cl-grid-cols-1`, `cl-grid-cols-2`
- **Utilities:** `cl-transition`, `cl-truncate`, `cl-line-clamp-2`, `cl-line-clamp-3`

## Security

- Markdown sanitization via `rehype-sanitize`
- Zod validation for inputs and actions
- HTTP-only cookie sessions for admin auth
- Bcrypt password verification flow
- Configurable AI request rate limiting

## Troubleshooting

### Too many MongoDB connections

Ensure your app uses the SDK's singleton DB connection pattern and avoids creating duplicate connections per request.

### Admin login fails

1. Confirm `CHANGELOG_ADMIN_PASSWORD` is a valid bcrypt hash
2. Verify cookies are enabled
3. Clear cookies and retry

### AI enhancement fails

1. Check `CHANGELOG_AI_PROVIDER`
2. Verify provider credentials:
   - OpenAI → `OPENAI_API_KEY`
   - Gemini → `GOOGLE_GENERATIVE_AI_API_KEY`
   - Ollama → running server at `OLLAMA_BASE_URL`

### Unexpected host app styles

Avoid overriding `cl-` prefixed selectors globally. If you use deep imports instead of `changelog-sdk`, ensure the SDK stylesheet is included.

## Development (SDK Contributors)

Run commands from this repository root:

```bash
bun install
bun run build
bun run type-check
bun run example:install
bun run example:dev
```

## License

MIT
