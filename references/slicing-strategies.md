# Slicing Strategies

Build in thin vertical slices — implement one piece, test it, verify it, then expand. Each increment should leave the system in a working, testable state.

## Three Strategies

### 1. Vertical Slices (Default)

Build one complete path through the stack per slice:

```
Slice 1: Create entity (DB + API + basic UI) → tests pass, user can create
Slice 2: List entities (query + API + UI)     → tests pass, user can list
Slice 3: Edit entity (update + API + UI)      → tests pass, user can modify
Slice 4: Delete entity (delete + API + confirm)→ tests pass, full CRUD
```

**Use when:** standard feature work with clear functional boundaries.

### 2. Contract-First Slicing

When backend and frontend must develop in parallel:

```
Slice 0: Define API contract (types, interfaces, OpenAPI)
Slice 1a: Backend against contract + API tests
Slice 1b: Frontend against mock data matching contract
Slice 2: Integrate and test end-to-end
```

**Use when:** multiple developers or agents work simultaneously on different layers.

### 3. Risk-First Slicing

Tackle the riskiest or most uncertain piece first:

```
Slice 1: Prove the uncertain integration works (highest risk)
Slice 2: Build on the proven foundation
Slice 3: Add edge cases and polish
```

**Use when:** the task has a technical unknown that could invalidate the approach.

## The Increment Cycle

For each slice:

1. **Implement** the smallest complete piece
2. **Test** — run the test suite or write a test if none exists
3. **Verify** — tests pass, build succeeds, manual check
4. **Commit** — atomic commit with descriptive message
5. **Next slice** — carry forward

## Scope Discipline

Touch only what the task requires. Do NOT:

- "Clean up" adjacent code
- Refactor imports in unmodified files
- Remove comments you don't fully understand
- Add features not in the spec

If you notice something worth improving outside scope, report it without fixing:

```
NOTICED BUT NOT TOUCHING:
- src/utils/format.ts has an unused import (unrelated to this task)
- The auth middleware could use better error messages (separate task)
```

## Scope-Creep Detection

The `${CLAUDE_PLUGIN_ROOT}/scripts/lib/scope/diff-scope-check.cjs` script compares the actual `git diff` against the declared file list in `implementation.md`. Files modified but not declared require an explicit justification or the check fails.

## Rules

- **One thing at a time**: each increment changes one logical thing
- **Keep it compilable**: project must build and tests must pass after each increment
- **Feature flags for incomplete features**: hide unfinished work behind flags
- **Safe defaults**: new code defaults to conservative behavior
- **Rollback-friendly**: each increment should be independently revertable
- **100-line threshold**: if you've written >100 lines without running tests, stop and test
