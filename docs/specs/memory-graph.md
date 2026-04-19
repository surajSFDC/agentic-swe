# Durable memory and project graph (Phase 2)

This spec complements [`docs/roadmap.md`](../roadmap.md) Phase 2 and root [`CLAUDE.md`](../../CLAUDE.md). It is **original** to agentic-swe; do not copy prompts or code from third-party graph products.

## Goals

- **Local** compaction + queryable store (SQLite by default).
- **Token-efficient** runtime: small **prime** payloads and deterministic **graph** summaries before heavy retrieval.
- **Clean-room optional enrichment**: external pipelines may supply graph fragments only through a **versioned import contract** (see Layer C below)—no vendored upstream tools.

## Layers

| Layer | Description |
| :--- | :--- |
| **A — Core** | Deterministic ingest, FTS, optional embeddings; config in [`config/memory.default.json`](../../config/memory.default.json), overrides in `.agentic-swe/memory.json`. |
| **B — User pipelines** | Any tooling the repo author runs outside this pack. |
| **C — Import boundary** | Future `memory-import`: validated JSON with provenance, caps (`import_adapter` in config), merge into the same SQLite store. |

## Storage layout

- Default directory: **`.agentic-swe/`** under the target project root.
- Default DB file: **`memory.sqlite`** (gitignored; see root `.gitignore`).
- Schema for **config** (not the SQLite DB): [`schemas/memory-config.schema.json`](../../schemas/memory-config.schema.json).

## Loader API

- Node: [`scripts/lib/memory/config.cjs`](../../scripts/lib/memory/config.cjs) — `loadMergedMemoryConfig(pluginRoot, projectRoot)`, `sqlitePathForProject`.
- Merge order: defaults → `AGENTIC_SWE_MEMORY_CONFIG` → `.agentic-swe/memory.json`.

## Governance

- Injected memory remains **advisory**; `state.json` and repo files stay authoritative per [`CLAUDE.md`](../../CLAUDE.md).
