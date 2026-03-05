# Changelog SDK for Next.js 16+

A pluggable, production-ready Changelog management SDK for Next.js 16+ with AI-powered enhancement, multi-provider AI support, and complete isolation from your host application's styling.

## Features

✅ **Zero-Style Pollution** - Uses scoped `cl-` CSS classes with no Tailwind/PostCSS requirement
✅ **Public Feed** - Beautiful, responsive changelog timeline at `/changelog`
✅ **Admin Portal** - Protected admin interface at `/changelog/admin` with editor
✅ **AI Enhancement** - Generate professional changelogs from raw notes using OpenAI, Gemini, or Ollama
✅ **Authentication** - Secure HTTP-only cookie-based admin authentication
✅ **Type-Safe** - Full TypeScript support with Zod validation
✅ **Server Components** - Leverages React 19 Server Components and Server Actions
✅ **Responsive Design** - Mobile-optimized UI built with Shadcn components

## 🚀 For SDK Developers

If you want to **develop and improve the SDK** itself:

- See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for quick setup
- See [SDK_DEVELOPMENT.md](./SDK_DEVELOPMENT.md) for detailed development guide

## For SDK Users

If you want to **use this SDK in your Next.js project**:

Continue reading below for installation and usage instructions.

## Installation

### 1. Add SDK from GitHub

Add the SDK as a GitHub dependency in your Next.js project's `package.json`:

```json
{
  "dependencies": {
    "changelog-sdk": "github:SebghatYusuf/changelog-sdk#main"
  }
}
```

Or with package managers:

```bash
bun add github:SebghatYusuf/changelog-sdk#main
npm install github:SebghatYusuf/changelog-sdk#main
yarn add github:SebghatYusuf/changelog-sdk#main
pnpm add github:SebghatYusuf/changelog-sdk#main
```

### 2. Install Dependencies

Using bun (recommended):

```bash
bun install
```

Alternatively with npm:

```bash
npm install
```

The SDK will be installed in `node_modules/changelog-sdk` and you can import it directly. No Tailwind/PostCSS setup is required.

### 3. Create Routing Structure

In your Next.js app, create the catch-all route:

**`app/changelog/[[...route]]/page.tsx`**

```typescript
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

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
# MongoDB Connection
CHANGELOG_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/changelog?retryWrites=true&w=majority

# Admin Password (MUST BE HASHED with bcryptjs in production)
CHANGELOG_ADMIN_PASSWORD=$2a$10$... # Use bcryptjs.hash('your-password', 10)

# AI Provider Configuration
CHANGELOG_AI_PROVIDER=openai # Options: openai, gemini, ollama

# OpenAI (if using openai provider)
OPENAI_API_KEY=sk-...

# Google Gemini (if using gemini provider)
GOOGLE_GENERATIVE_AI_API_KEY=...

# Ollama (if using ollama provider - local LLM)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Rate limiting
CHANGELOG_RATE_LIMIT=10 # Max AI calls per minute (default: 10)
```

### 5. CI/CD Deployment

The SDK will be automatically installed in your CI/CD pipeline because it's specified in `package.json`:

```bash
# In your CI/CD (GitHub Actions, GitLab CI, Bitbucket Pipelines, etc.)
bun install  # or npm install

# The changelog-sdk will be pulled from GitHub automatically
bun run build
```

No additional configuration is needed for your CI/CD platform—just commit the updated `package.json`.

## Usage

### Public Feed

Users can view published changelogs at:

- `/changelog` - Main feed with filtering and search
- Search by title or content
- Filter by tags (Features, Fixes, Improvements, Breaking, Security, Performance, Docs)

### Admin Portal

Admins can manage changelogs at:

- `/changelog/login` - Login page
- `/changelog/admin` - Admin dashboard (create, edit, delete entries)

**Default Admin Password:**

For development, set `CHANGELOG_ADMIN_PASSWORD` to a hashed password.

Using bcryptjs with bun:

```bash
bun -e "console.log(require('bcryptjs').hashSync('your-admin-password', 10))"
```

Or with Node.js:

```javascript
const bcryptjs = require('bcryptjs')
const password = 'your-admin-password'
const hashed = bcryptjs.hashSync(password, 10)
console.log(hashed) // Use this as CHANGELOG_ADMIN_PASSWORD
```

### AI Enhancement

In the admin portal, use the "AI Enhance" feature:

1. Enter raw notes about your update
2. Click "✨ Enhance with AI"
3. AI will generate:
   - Professional title
   - Formatted markdown body (Features, Fixes, Improvements sections)
   - Auto-detected tags
4. Review and modify if needed
5. Publish when ready

## API & Server Actions

### Create Changelog

```typescript
import { createChangelog } from 'changelog-sdk'

const result = await createChangelog({
  title: 'v1.2.0 Released',
  content: '## Features\n- New feature\n\n## Fixes\n- Bug fix',
  version: '1.2.0',
  status: 'published',
  tags: ['Features', 'Fixes'],
})
```

### Fetch Published Changelogs

```typescript
import { fetchPublishedChangelogs } from 'changelog-sdk'

const result = await fetchPublishedChangelogs(
  page,
  limit,
  tags?,
  search?
)
```

### AI Enhancement

```typescript
import { runAIEnhance } from 'changelog-sdk'

const result = await runAIEnhance({
  rawNotes: 'Fixed bug with auth, added dark mode, improved performance',
  currentVersion: '1.2.0'
})
```

### Authentication

```typescript
import {
  loginAdmin,
  logoutAdmin,
  checkAdminAuth
} from 'changelog-sdk'

// Check if user is authenticated
const isAdmin = await checkAdminAuth()

// Login
const result = await loginAdmin(password)

// Logout
await logoutAdmin()
```

## TypeScript Types

```typescript
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

## Styling with `cl-` Prefix

All internal styles use the `cl-` prefix to avoid conflicts:

```html
<div class="cl-card">
  <div class="cl-card-header">
    <h1 class="cl-h1">Title</h1>
  </div>
  <div class="cl-card-content">
    <p class="cl-p">Content</p>
  </div>
</div>
```

Available classes:

- **Typography**: `cl-h1`, `cl-h2`, `cl-h3`, `cl-h4`, `cl-p`, `cl-code`
- **Components**: `cl-card`, `cl-btn`, `cl-input`, `cl-textarea`, `cl-badge`, `cl-alert`
- **Layouts**: `cl-container`, `cl-section`, `cl-grid`, `cl-grid-cols-1`, `cl-grid-cols-2`
- **Utilities**: `cl-transition`, `cl-truncate`, `cl-line-clamp-2`, `cl-line-clamp-3`

## Database Schema

The SDK uses MongoDB with Mongoose. Key fields:

```typescript
{
  _id: ObjectId
  title: string
  slug: string // Auto-generated from title
  content: string // Markdown format
  version: string // e.g., "1.2.3"
  date: Date
  status: 'draft' | 'published'
  tags: string[] // Array of tags
  aiGenerated: boolean
  rawNotes?: string // Original input if AI-generated
  createdAt: Date
  updatedAt: Date
}
```

## Security Considerations

- ✅ **XSS Protection**: Markdown rendering sanitized with `rehype-sanitize`
- ✅ **CSRF Protection**: Built-in Next.js CSRF protection for forms
- ✅ **HTTP-Only Cookies**: Admin sessions use secure, HTTP-only cookies
- ✅ **Password Hashing**: Admin password hashed with bcryptjs
- ✅ **Input Validation**: All inputs validated with Zod schemas
- ✅ **Rate Limiting**: Optional rate limiting on AI endpoints (default: 10 calls/min)

## Troubleshooting

### "Too many connections" error

The Mongoose connection uses a singleton pattern. Ensure you're only calling `connectDB()` once per application instance.

### Admin authentication not working

1. Verify `CHANGELOG_ADMIN_PASSWORD` is set and hashed
2. Check that cookies are enabled
3. Clear browser cookies and try again

### AI Enhancement not working

1. Verify `CHANGELOG_AI_PROVIDER` is set correctly
2. Check API key is valid for your chosen provider:
   - OpenAI: `OPENAI_API_KEY`
   - Gemini: `GOOGLE_GENERATIVE_AI_API_KEY`
   - Ollama: Ensure Ollama is running at `OLLAMA_BASE_URL`

### Styles appearing in host app

Ensure all class names use the `cl-` prefix. Check for any forgotten prefixes in custom styles.

## License

MIT

## Support

For issues or questions, check the troubleshooting section in README.md or visit the [Bitbucket repository](https://bitbucket.org/your-workspace/changelog-sdk).
