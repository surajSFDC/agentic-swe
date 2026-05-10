# Deprecation and Migration

Code is a liability, not an asset. Every line you keep must earn its place. This reference covers removing code, deprecating interfaces, and migrating consumers with the same evidence rigor the pipeline applies to adding code.

## When to Apply

Invoke this reference when the work item **removes** code, deprecates an interface, or migrates consumers from one system to another. This includes:

- Deleting dead code or unused features
- Replacing one library/pattern with another
- Sunsetting an API endpoint
- Removing feature flags after rollout is complete

## Removal Manifest

Before deleting anything, produce a **Removal Manifest** in `implementation.md`:

```markdown
## Removal Manifest

### Items to Remove
| Item | Type | Last Used | Consumers | Risk |
|---|---|---|---|---|
| `src/legacy/auth.ts` | module | 6 months ago | 0 direct imports | low |
| `POST /api/v1/login` | endpoint | active | 3 internal clients | high |

### Deprecation Type
- [ ] **Compulsory** — remove immediately (no consumers, or consumers already migrated)
- [ ] **Advisory** — mark deprecated, set removal date, notify consumers

### Migration Path (if advisory)
1. <step 1: what consumers should do instead>
2. <step 2: verification that migration is complete>
3. <step 3: removal after migration window>

### Verification
- [ ] No runtime references remain (grep, static analysis)
- [ ] Tests updated or removed
- [ ] Build passes without the removed code
- [ ] No dangling imports, routes, or config entries
```

## Zombie-Code Sweep

When the task touches a module, check for zombie code nearby:

- Unused exports (no importers)
- Feature flags that are permanently on or off
- Commented-out code blocks older than 2 releases
- Dead branches in conditionals (always true/false)

Report zombies in the "NOTICED BUT NOT TOUCHING" block (per `${CLAUDE_PLUGIN_ROOT}/references/slicing-strategies.md`) unless removal is in scope.

## Chesterton's Fence Rule

Before removing code that looks unnecessary:

1. **Understand why it exists.** Read git blame, commit messages, and linked issues.
2. **If you cannot determine why it exists, do not remove it.** Flag it for human review.
3. **If you understand why and the reason no longer applies, document the reason and remove.**

## Evidence Requirements

Removals require the same verification evidence as additions:

- **Before state**: the code exists and (optionally) what it does
- **After state**: the code is gone, build passes, tests pass
- **No dangling references**: grep/search output showing zero remaining references
