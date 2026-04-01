# Slash command `/check` (quick reference)

The pipeline’s enforcement checks are invoked as **`/check <subcommand>`** inside Claude Code (see `.claude/commands/check.md` for full prompts).

| Invocation | Purpose |
|------------|---------|
| `/check budget` | Iteration and cost budgets; loop counters; **PROCEED** vs **STOP** |
| `/check transition <from> <to>` | Whether a state transition is allowed per `CLAUDE.md` |
| `/check artifacts <state>` | Required artifacts for the destination state |

Use these **before** advancing the state machine when the orchestrator policy requires it.

Related: [troubleshooting.md](troubleshooting.md), [usage.md](usage.md).
