# OWAI 1.0 — Open Work-item Interchange Specification

**Version:** 1.0-draft
**Status:** Draft
**Reference implementation:** agentic-swe

## Abstract

OWAI defines a portable, machine-readable format for representing the lifecycle of an autonomous software engineering work item. A conformant work item includes state, transitions, artifacts, budgets, and history — enough for any tool to read, write, validate, or replay the engineering pipeline.

## Motivation

Autonomous coding agents produce work — but the work's state, evidence, and governance are locked inside proprietary formats or ephemeral chat sessions. OWAI provides a common contract so:

- Teams can audit agent work after the fact
- Tools can produce and consume work items interchangeably
- CI systems can enforce pipeline rules without tool-specific plugins
- Training data pipelines can ingest structured engineering traces

## Conformance Levels

| Level | Name | Requirement |
|---|---|---|
| L1 | **Read** | Can parse a conformant work directory and extract state, history, and artifacts |
| L2 | **Read + Write** | Can produce conformant work directories that pass schema validation |
| L3 | **Enforce** | Can validate transitions, budgets, and artifact requirements against the state machine |

## Work Directory Structure

A conformant work directory contains:

```
<work-dir>/
  state.json          # Required: current state, pipeline, budgets, history
  progress.md         # Required: human-readable progress log
  audit.log           # Required: append-only trail with actor attribution
  <artifact>.md       # Phase artifacts (feasibility.md, design.md, etc.)
```

## state.json Schema

See `schemas/owai/state.schema.json` for the full JSON Schema.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `schema_version` | integer | Schema version (currently 2) |
| `work_id` | string | Unique identifier |
| `task` | string | Human-readable task description |
| `current_state` | string | Current pipeline state |
| `created_at` | ISO-8601 | Creation timestamp |
| `updated_at` | ISO-8601 | Last modification timestamp |
| `budget` | object | `{ iteration_budget, budget_remaining, cost_budget_usd, cost_used }` |
| `counters` | object | Loop counters for bounded phases |
| `pipeline` | object | Track, complexity, flags |
| `history` | array | Ordered transition entries |

### History Entry

Each entry in `history[]` requires exactly one of `timestamp` or `at` as the transition timestamp (both are accepted; `at` is the field used by the reference implementation):

```json
{
  "timestamp": "ISO-8601",
  "actor": "hypervisor|developer|user|...",
  "from": "state-name",
  "to": "state-name",
  "reason": "Why this transition happened",
  "evidence_summary": "Key evidence supporting the transition",
  "artifact_hashes": { "filename.md": "sha256-hex" }
}
```

## State Machine

The canonical state machine is defined in a separate `state-machine.json`:

```json
{
  "states": ["initialized", "feasibility", ...],
  "transitions": {
    "initialized": ["feasibility"],
    "feasibility": ["ambiguity-wait", "lean-track-check", "pipeline-failed"],
    ...
  },
  "tracks": {
    "lean": { ... },
    "standard": { ... },
    "rigorous": { ... }
  }
}
```

## Artifact Contract

Each pipeline state declares required artifacts. A conformant tool must:

1. Produce the required artifacts before transitioning out of a state
2. Ensure artifacts are non-empty
3. Record artifact filenames in `state.json.artifacts`

## Validation

Use the conformance runner:

```bash
node scripts/owai-conformance.cjs <work-dir> [--level L1|L2|L3]
```

## Extensibility

Tools may add custom fields to `state.json` under a namespaced key (e.g. `"x_mytool": {}`). Conformance validation ignores `x_*` prefixed fields.

## License

This specification is released under MIT. Implementations are not required to be open source.
