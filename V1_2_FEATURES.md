# Changelog SDK v1.2 Additions

This document explains what was added in v1.2 and how to use it.

## 1) Configurable Mount Path (`basePath`)

You can now mount the SDK under any route prefix, not only `/changelog`.

Example:

```tsx
import { ChangelogManager } from 'changelog-sdk'

export default function ChangelogPage(props: {
  params: Promise<{ route?: string[] }>
  searchParams: Promise<{ page?: string; tags?: string; search?: string }>
}) {
  return <ChangelogManager {...props} basePath="/updates" />
}
```

What it affects:
- Feed links
- Admin/login links
- Edit/detail links
- Pagination navigation
- Revalidation path for mutations
- Preview URL generation

Default remains `/changelog` when `basePath` is not provided.

---

## 2) Workflow + Draft Improvements

Entries now support richer workflow states:

- `draft`
- `pending_approval`
- `approved`
- `scheduled`
- `published`

Additional fields:
- `scheduledAt?: Date`
- `publishedAt?: Date`
- `approvalNote?: string`
- `previewTokenVersion?: number`

Behavior:
- `status` is still present for backward compatibility (`draft` / `published`).
- `status` is derived from workflow state.
- Scheduled entries are auto-published lazily when due (`scheduledAt <= now`) during action/feed/admin reads.

New action:

```ts
import { transitionChangelogWorkflow } from 'changelog-sdk'

await transitionChangelogWorkflow(
  {
    id: entryId,
    nextState: 'scheduled',
    scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
  },
  { basePath: '/updates' }
)
```

---

## 3) Slug + Version Robustness

### Slugs
- Slugs are generated deterministically from title.
- Collision strategy: `slug`, `slug-2`, `slug-3`, ...
- Includes duplicate-key fallback safety.

### Versions
- Semver normalization/validation is centralized.
- Duplicate key errors are mapped to user-friendly messages.
- Optional global unique version index is available via:

```env
CHANGELOG_ENFORCE_UNIQUE_VERSION_INDEX=true
```

---

## 4) Observability, Events, and Webhooks

New runtime config API:

```ts
import { configureChangelogSDK } from 'changelog-sdk'

configureChangelogSDK({
  logger: {
    info: (msg, meta) => console.log(msg, meta),
    error: (msg, meta) => console.error(msg, meta),
  },
  onError: async (error, context) => {
    // send to Sentry/DataDog/etc.
  },
  webhooks: [
    {
      url: 'https://example.com/changelog-webhook',
      secret: process.env.CHANGELOG_WEBHOOK_SECRET!,
      events: ['entry.created', 'entry.published'],
      retries: 2,
      timeoutMs: 5000,
    },
  ],
})
```

Event subscription API:

```ts
import { onChangelogEvent } from 'changelog-sdk'

const unsubscribe = onChangelogEvent((event) => {
  console.log(event.type, event.payload)
})

// later
unsubscribe()
```

Core event names:
- `entry.created`
- `entry.updated`
- `entry.published`
- `entry.scheduled`
- `entry.approved`
- `entry.deleted`
- `entry.preview_link_created`
- `error`

Webhook details:
- Signed using HMAC SHA-256
- Headers:
  - `x-changelog-sdk-signature`
  - `x-changelog-sdk-timestamp`
- Retries with bounded backoff

---

## 5) Preview URLs (Signed Share Links)

You can generate expiring preview URLs for drafts/non-published states.

```ts
import { generateChangelogPreviewLink } from 'changelog-sdk'

const result = await generateChangelogPreviewLink(
  { id: entryId, expiresInHours: 24 },
  { basePath: '/updates' }
)

console.log(result.data?.url) // /updates/preview/<token>
```

Preview route shape:
- `/<basePath>/preview/:token`

Token behavior:
- Signed
- Expiring
- Invalidated if `previewTokenVersion` no longer matches

---

## 6) Test Suite (Vitest + Mongo Memory Server)

Added:
- Unit tests for:
  - semver helpers
  - workflow transitions
  - path helpers
- Integration tests for:
  - create/update/workflow transitions
  - slug collision handling
  - preview link flow
  - settings/admin feed behavior

Scripts:

```bash
# One-time binary preparation for integration DB
bun run test:integration:prepare

# Unit tests only
bun run test:unit

# Integration tests only (no runtime binary download)
bun run test:integration

# Full suite
bun run test
```

Notes:
- Integration tests use cached MongoDB binary in `.cache/mongodb-binaries`.
- Runtime download is disabled during integration test execution.

---

## 7) New/Extended Exports

### New config/event exports
- `configureChangelogSDK`
- `onChangelogEvent`
- `SDKLogger` (type)
- `ChangelogSDKConfig` (type)
- `WebhookTarget` (type)
- `ChangelogEvent` (type)
- `ChangelogEventName` (type)

### New workflow/preview actions
- `transitionChangelogWorkflow`
- `generateChangelogPreviewLink`
- `fetchChangelogByPreviewToken`

### Manager/API updates
- `ChangelogManager` now supports `basePath?: string`
- Action context supports optional `{ basePath?: string }` for mutation helpers

