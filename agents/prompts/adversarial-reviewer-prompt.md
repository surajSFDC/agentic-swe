# Adversarial Reviewer Prompt

Use this template when invoking a fresh-context reviewer in a Doubt-Driven Verification cycle (see `${CLAUDE_PLUGIN_ROOT}/references/doubt-driven-verification.md`).

This prompt **overrides** the default response shape of any persona (e.g. `code-reviewer`, `security-auditor`). The reviewer must produce **issues only** — no balanced verdicts, no strengths section, no summary praise.

## Template

```
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident. Look for:

- Unstated assumptions
- Edge cases not handled
- Hidden coupling or shared state
- Ways the contract could be violated
- Existing conventions this might break
- Failure modes under unexpected input

Do NOT validate. Do NOT summarize. Do NOT praise.
Find issues, or state explicitly that you cannot find any
after thorough examination.

ARTIFACT:
<paste artifact here>

CONTRACT:
<paste contract here>
```

## Rules

- **Never include the CLAIM** in the reviewer's input. Passing the orchestrator's hypothesis biases the reviewer toward agreement.
- **Never include your reasoning** about why the artifact is correct. The reviewer must form its own judgment.
- **Strip to minimum context.** If the artifact is >200 lines, decompose it before review.
- The reviewer's output is **data** to reconcile, not a verdict to obey.

## Response Shape

The reviewer should produce:

```
FINDINGS:
1. [severity: high|medium|low] <description>
   Evidence: <specific reference to artifact text>
2. ...

NO ISSUES FOUND (only if genuinely none after thorough examination)
```

## Usage in Claude Code

```
Agent(prompt="${CLAUDE_PLUGIN_ROOT}/agents/prompts/adversarial-reviewer-prompt.md",
      description="DDV adversarial review of <scope>",
      run_in_background=false)
```

For panel-level agents (architect, security, adversarial), paste the adversarial prompt verbatim into the invocation so it overrides the persona's default response shape.
