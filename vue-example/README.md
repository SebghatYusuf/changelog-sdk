# Changelog SDK Vue + Express Example

This example app demonstrates Vue Router integration with `changelog-sdk/vue` and an Express backend using `changelog-sdk/express`.

## What is wired

- Vue Router route at `/changelog/*` using `ChangelogManager`
- Changelog styles imported from `changelog-sdk/styles`
- Express API mounted at `/api/changelog`
- Local dependency linking via `"changelog-sdk": "file:.."`

## Setup

1. Install dependencies (from repository root):

```bash
cd vue-example && bun install
```

2. Configure environment variables in `vue-example/.env` (or shell):

- `CHANGELOG_MONGODB_URI`
- `CHANGELOG_SESSION_SECRET` (min 32 chars)
- Optional AI vars: `CHANGELOG_AI_PROVIDER`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OLLAMA_BASE_URL`

3. Create your first admin account (from repository root):

```bash
bun run create:admin your-admin@email.com your-password "Admin"
```

4. Start the backend and frontend (two terminals):

```bash
cd vue-example && bun run dev:server
```

```bash
cd vue-example && bun run dev:client
```

- Vue app: `http://localhost:5173`
- API server: `http://localhost:5174`

## Routes to verify

- `/` Example landing page with integration links
- `/changelog` Public changelog feed
- `/changelog/login` Admin login
- `/changelog/admin` Admin portal (protected)
