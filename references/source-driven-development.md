# Source-Driven Development

Ground every framework and library decision in official documentation. Verify, cite sources, and explicitly flag what's unverified.

## Core Principle

LLMs "remember" APIs that don't exist. When writing code that uses a framework or library, every non-trivial API call must be traceable to an authoritative source.

## Citation Rules

### VERIFIED Markers

When you confirm an API, pattern, or behavior against an official source:

```
VERIFIED: Express.Router().param() accepts (name, callback)
  Source: https://expressjs.com/en/api.html#router.param
```

### UNVERIFIED Markers

When you cannot confirm against an official source:

```
UNVERIFIED: Redis.pipeline() supports automatic batching of MULTI/EXEC
  Confidence: medium (based on training data, not docs)
  Risk: could silently fail to batch, causing N+1 round trips
  Action needed: verify against https://redis.io/docs/manual/pipelining/
```

## When to Apply

Apply SDD markers in these phases:

- **Feasibility** (`phases/feasibility.md`): when assessing whether a library can do what the task requires
- **Design** (`phases/design.md`): when choosing between approaches that depend on library capabilities
- **Implementation** (`phases/implementation.md`): when writing code that calls external APIs

## Verification Hierarchy

1. **Official docs** (e.g. react.dev, nodejs.org/api) — strongest
2. **Source code** (e.g. reading the actual library source on GitHub) — strong
3. **Official examples/tutorials** from the maintainers — good
4. **Changelog / release notes** — good for version-specific features
5. **Community answers** (Stack Overflow, blog posts) — weak, mark as UNVERIFIED unless cross-checked

## Anti-Patterns

| Anti-Pattern | Risk | Fix |
|---|---|---|
| "I know this API exists" without checking | Hallucinated API; runtime crash or silent wrong behavior | Check official docs before using |
| Citing an API from the wrong version | Breaks on the project's actual version | Check the version in package.json/requirements.txt |
| Trusting training data over docs | APIs change between model training cutoff and now | Always prefer live docs |
| Omitting the UNVERIFIED marker | Downstream phases treat the claim as fact | Mark it; let downstream decide |

## Integration with Pipeline

- **Verification standard** (`references/verification-standard.md`): UNVERIFIED markers are a form of explicit uncertainty — the opposite of banned hedging language
- **Doubt-driven verification** (`references/doubt-driven-verification.md`): UNVERIFIED claims are prime candidates for DDV cycles
- **Code review** (`phases/code-review.md`): reviewers should flag any library API call without a VERIFIED or UNVERIFIED marker
