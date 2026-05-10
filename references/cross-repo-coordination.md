# Cross-Repo Work Items

Lift `.worklogs/<id>/` from single-repo to multi-repo coordination. A work item can declare linked repositories with artifact dependencies.

## Schema Extension

`state.json.linked_repos[]` (see `schemas/work-item.schema.json`):

```json
{
  "linked_repos": [
    {
      "path": "/absolute/path/to/backend",
      "role": "dependency",
      "required_artifacts": ["api-contract.md"],
      "status": "pending"
    }
  ]
}
```

## Roles

| Role | Semantics |
|---|---|
| `primary` | This repo owns the work item |
| `dependency` | This repo must produce required artifacts before the primary can proceed |
| `consumer` | This repo will be affected by the change (notification only) |

## Synchronization Checkpoints

1. **Link**: `work-engine link <work-dir> <repo-path> --role <role> --artifacts <list>`
2. **Status**: `work-engine status <work-dir>` shows cross-repo artifact readiness
3. **Gate**: transitions in the primary repo that depend on linked artifacts block until `status` is "ready"
4. **Unlink**: `work-engine unlink <work-dir> <repo-path>`

## Conflict Rules

- The primary repo's `state.json` is authoritative for transition decisions.
- Linked repos' artifacts are validated by existence and non-emptiness, not content review.
- If a linked repo's artifact is missing at transition time, the transition blocks with a clear message.
- Cross-repo cycles (A depends on B depends on A) are rejected at `link` time.

## Constraints

- All repos must be on the local filesystem (no remote repo support).
- Cross-repo coordination is opt-in — single-repo workflows are unaffected.
- The `work-engine` validates linked artifacts as part of `/check artifacts`.
