# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## Architecture

The source is organized **feature-first**. Read [`src/ARCHITECTURE.md`](src/ARCHITECTURE.md)
before adding or moving files — it documents the layout, the RBAC and workflow models, and
common recipes (add a collection, add a role, add a workflow transition).

Quick map:
- `src/features/` — domain modules: `content` (collections), `rbac`, `workflow`, `search`, `seed`
- `src/site/` — Header/Footer globals
- `src/shared/` — presentation & utilities (blocks, heros, components, fields, hooks, providers, utilities)
- `src/app/` — Next.js routes (do not relocate); `src/payload.config.ts` — root config

## Conventions

- **Imports:** use the `@/` alias for anything outside the current directory; only `./x`
  (same dir) or `..` (parent index) relative imports are allowed. No `../../…`, no `src/…`.
- **Feature barrels:** import via `@/features/rbac`, `@/features/workflow`, `@/features/content`
  rather than deep paths.
- **Generated files:** never hand-edit `src/payload-types.ts`. Run `pnpm generate:types` after
  schema changes and `pnpm generate:importmap` after adding/moving any admin component.
- **Access control:** reuse the `Access` functions in `@/features/rbac`; default to restrictive.
- **Verify:** `npx tsc --noEmit` is the fast correctness gate (ESLint config is currently broken).
