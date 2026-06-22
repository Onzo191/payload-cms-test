# Source Architecture

This project is a **Payload CMS 3 + Next.js** app organized **feature-first**: domain
logic is grouped by *what it does* (`features/`), not by *what type of file it is*.

## Layout

```txt
src/
├── app/                  # Next.js App Router — DO NOT relocate (route folders are URLs)
│   ├── (frontend)/       #   public website
│   └── (payload)/        #   Payload admin panel + REST/GraphQL routes + importMap.js
│
├── features/             # Domain modules — the heart of the app
│   ├── content/          #   editorial collections: Pages, Posts, Media, Categories
│   ├── rbac/             #   roles + access-control functions + the Users collection
│   ├── workflow/         #   content approval workflow (states, transitions, audit, widget)
│   ├── search/           #   search plugin wiring (Component, beforeSync, fieldOverrides)
│   └── seed/             #   demo-data seeding endpoint
│
├── site/                 # Site chrome globals: Header, Footer
│
├── shared/               # Cross-cutting, presentation & utilities (no domain rules)
│   ├── blocks/           #   Lexical/layout blocks
│   ├── heros/            #   hero variants
│   ├── components/       #   reusable React components (incl. ui/ primitives)
│   ├── fields/           #   reusable Payload field factories (link, linkGroup, …)
│   ├── hooks/            #   generic collection hooks (publishedAt, revalidate)
│   ├── providers/        #   React context providers (Theme, HeaderTheme)
│   └── utilities/        #   pure helpers (formatting, URLs, deepMerge, …)
│
├── plugins/              # Aggregated Payload plugins (seo, redirects, form-builder, …)
├── migrations/           # Payload DB migrations — Payload convention, keep here
├── payload.config.ts     # Root config; resolved by the `@payload-config` alias
└── payload-types.ts      # GENERATED — never edit by hand (run `pnpm generate:types`)
```

### Why these boundaries
- **`features/`** = decisions/rules a stakeholder would recognize (who can publish, what
  states content moves through). Each feature owns its config, hooks, components, types.
- **`shared/`** = swappable plumbing with no business meaning. If deleting it would only
  change *appearance*, not *rules*, it belongs here.
- **`site/`** = global page chrome (Header/Footer), distinct from reusable `shared/`.

## Import conventions

1. **Always use the `@/` alias** (`@/*` → `src/*`) for anything outside the current
   directory. The only relative imports allowed are same-directory (`./x`) or a direct
   parent index (`..`). No `../../…` and no `src/…` absolute imports.
2. **Import features through their barrel** when one exists:
   ```ts
   import { ROLES, hasRole, adminOrEditor } from '@/features/rbac'
   import { approvalStatusField, validateTransition, WF } from '@/features/workflow'
   import { Posts, Pages } from '@/features/content'
   ```
3. **Admin components are referenced by string path** (e.g. `'@/features/workflow/Widget'`)
   and resolved through `src/app/(payload)/admin/importMap.js`. After moving or adding any
   admin component, run `pnpm generate:importmap`.

## RBAC model (`features/rbac/`)

- **Roles** (`roles.ts`): `super-admin · admin · editor · author · reviewer · viewer`.
  Helpers: `hasRole(user, ...roles)`, `canPublish`, `canReview`, `canManageUsers`.
- **Access functions** (`byRole.ts` + base `anyone`/`authenticated`/`authenticatedOrPublished`):
  reusable Payload `Access` fns — `adminOrEditor`, `anyCreator`, `ownOrEditor`, `adminOnly`,
  `anyAuthenticated`. These return query constraints (not just booleans) for row-level rules.

## Workflow model (`features/workflow/`)

- **States** (`types.ts` → `WF`): `draft → pending_review → {approved | changes_requested}
  → published → archived`. Legal moves + which roles may make them live in `TRANSITIONS`.
- **Fields** (`field.ts`): `approvalStatusField()` + `workflowAuditFields()`
  (`reviewNote`, `submittedBy`, `reviewedBy`, `reviewedAt`). Add to a collection's `fields`.
- **Enforcement** (`hooks/validateTransition.ts`): a `beforeChange` hook that rejects illegal
  transitions, blocks non-publishers from publishing, and stamps audit fields.
- **Widget** (`Widget/`): admin dashboard badge counting items pending review / changes.

## Recipes

**Add an editorial collection** → create `features/content/<Name>/index.ts`, export it from
`features/content/index.ts`, register it in `payload.config.ts > collections`. Reuse
`@/features/rbac` access fns. To put it under approval, spread `approvalStatusField()` +
`workflowAuditFields()` into `fields` and add `validateTransition` to `beforeChange`.

**Add a role** → extend `ROLES` in `features/rbac/roles.ts`, add the option in
`features/rbac/Users/index.ts`, update the relevant `can*` helpers, then
`pnpm generate:types`.

**Add a workflow transition** → add a row to `TRANSITIONS` in `features/workflow/types.ts`.

After any schema change run `pnpm generate:types`; after any admin component change run
`pnpm generate:importmap`.
