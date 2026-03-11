# Changelog SDK Next.js Example

This example app demonstrates App Router integration with `changelog-sdk/next`.

## What is wired

- Catch-all changelog route at `app/changelog/[[...route]]/page.tsx`
- Changelog styles imported in `app/changelog/layout.tsx`
- Root page links to public feed, login, and admin routes
- Uses local dependency linking via `"changelog-sdk": "file:.."`

Note: scripts use webpack mode (`--webpack`) for stable local linked-package behavior in this workspace.

## Setup

1. Install dependencies (from repository root):

```bash
bun run example:install
```

2. Configure environment variables in `.env.local`:

- `CHANGELOG_MONGODB_URI`
- `CHANGELOG_ADMIN_PASSWORD` (bcrypt hash)
- Optional AI vars: `CHANGELOG_AI_PROVIDER`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OLLAMA_BASE_URL`

3. Start the example app:

```bash
bun run example:dev
```

## Routes to verify

- `/` Example landing page with integration links
- `/changelog` Public changelog feed
- `/changelog/login` Admin login
- `/changelog/admin` Admin portal (protected)
