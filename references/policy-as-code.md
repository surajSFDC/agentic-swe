# Policy-as-Code (PaC)

Organizations and repositories can publish typed policy files that merge with pack defaults, enforcing engineering standards through the pipeline rather than through documentation alone.

## How It Works

1. **Pack default**: `config/default-policy.json` ships with agentic-swe
2. **Repo policy**: `.agentic-swe/policy.json` in the target repository
3. **Org policy**: pointed to by `AGENTIC_SWE_POLICY` environment variable

Policies merge with precedence: **org > repo > pack default**.

## Policy Schema

See `${CLAUDE_PLUGIN_ROOT}/schemas/agentic-swe-policy.schema.json`.

### Track Rules

Force minimum track depth based on file patterns:

```json
{
  "track_rules": [
    { "pattern": "src/auth/**", "minimum_track": "rigorous", "reason": "Auth changes require full governance" },
    { "pattern": "*.sql", "minimum_track": "standard", "reason": "Schema changes need design review" }
  ]
}
```

### Mandatory Subagents

Require specific specialist reviewers for sensitive areas:

```json
{
  "mandatory_subagents": [
    { "pattern": "src/payments/**", "subagent": "quality-security/security-auditor.md", "phase": "code-review" }
  ]
}
```

### Banned Tools

Prevent specific tool combinations in certain contexts:

```json
{
  "banned_tools": [
    { "tool": "git push --force", "context": "main branch", "reason": "Protected branch" }
  ]
}
```

### Budget Overrides

Adjust cost and iteration limits:

```json
{
  "budget_overrides": {
    "max_cost_usd": 10.0,
    "max_iterations": 15,
    "max_doubt_cycles": 5
  }
}
```

## Commands

- `/policy show` — display effective merged policy
- `/policy explain <state>` — show what's enforced for a state
- `/policy check` — validate policy schema

## CI Enforcement

`work-engine` reads the merged policy during `/check` commands. Invalid policies fail with structured errors.
