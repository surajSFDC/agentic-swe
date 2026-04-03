# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-04-04

### Breaking

- Renamed pipeline tracks for clarity: **lean track** (low-risk shortcut) and **rigorous track** (design, reviews, full test strategy). User-facing prose, phase files, and `state.json` all use the new vocabulary.
- State names: `lean-track-check`, `lean-track-implementation` (replaces `fast-path-check`, `fast-path-implementation`). Phase files: `lean-track-check.md`, `lean-track-implementation.md`.
- `state.json`: `pipeline.lean_track_eligible`, `pipeline.lean_track_decision`, `counters.lean_iter`, `artifacts["lean-track-check"]` (replaces `fast_path_*`, `fast_iter`, `fast-path-check`).

### Migration

- For existing work under `.claude/.work/<id>/`, run from the target repo root: `node scripts/migrate-lean-track-state.js` (dry-run) then `node scripts/migrate-lean-track-state.js --apply`. The script ships with the npm package under `scripts/`.

### Added

- `scripts/migrate-lean-track-state.js` — migrates legacy `state.json` and renames `fast-path-check.md` → `lean-track-check.md` when present.

## [1.1.2] - 2026-04-02

### Added

- CLI: `agentic-swe --version` / `-v`, version shown in `--help`
- CLI: `agentic-swe doctor [path]` — checks Node 18+, git, and pipeline layout
- CLI: `--dry-run` / `-n` — prints planned install actions without writing files
- `CHANGELOG.md` for release notes
- `docs/troubleshooting.md`, `docs/check-commands.md`
- `.claude/templates/metrics-summary.md` (optional work-item metrics)
- `scripts/verify-sanity.js` and `npm run verify` in CI

### Documentation

- README: how this differs from hosted “coding agent” frameworks
- PRO.md: clearer separation of what Pro is and is not

## [1.1.1] - earlier

See git history for prior releases.
