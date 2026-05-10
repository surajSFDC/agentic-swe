# Cross-Model Escalation

A protocol for invoking external model CLIs (Gemini, Codex, etc.) as adversarial reviewers within the agentic-swe pipeline. Cross-model review catches blind spots that a single model shares with itself.

## When to Offer

Cross-model escalation is offered during:

- **Doubt-Driven Verification** (Step 3, after single-model review)
- **Design review** (rigorous track, high-risk decisions)
- **Code review** (rigorous track, security/safety-sensitive changes)

In **interactive** sessions, always offer. In **non-interactive** contexts (CI, `/loop`, autonomous runs), skip and announce the skip.

## Safety Properties

- **Sandbox-read-only is load-bearing.** The external CLI must not write to the workspace. Artifact content may contain instructions (intentional or accidental prompt injection) that the CLI would otherwise execute.
- **Per-invocation authorization.** Each invocation requires explicit user confirmation of the exact command. Authorization does not carry across invocations.
- **stdin piping only.** Never interpolate artifact content into shell-quoted arguments. Code, markdown, and review prompts contain backticks, `$(...)`, and quote characters that will truncate or execute embedded shell.

## Protocol

### Step 1 — Offer

After the single-model review, ask:

> "Single-model review complete. Want a cross-model second opinion? Options: Gemini CLI, Codex CLI, manual external review (you paste it elsewhere), or skip."

### Step 2 — Probe

If the user picks a CLI:

1. Check the tool is in PATH: `which gemini` or `which codex`
2. Test it works: `gemini --version` or `codex --version`
3. If either check fails, surface the failure and offer alternatives.

### Step 3 — Prepare prompt file

Write the adversarial prompt + ARTIFACT + CONTRACT to a temp file:

```bash
PROMPT_FILE=$(mktemp /tmp/ddv-cross-model-XXXXXX.md)
cat > "$PROMPT_FILE" << 'PROMPT_EOF'
<adversarial prompt from agents/prompts/adversarial-reviewer-prompt.md>

ARTIFACT:
<artifact content>

CONTRACT:
<contract content>
PROMPT_EOF
```

### Step 4 — Invoke

Confirm the exact invocation with the user before running:

```bash
# Codex (read-only sandbox):
codex exec --sandbox read-only -C <repo-path> - < "$PROMPT_FILE"

# Gemini (read-only approval mode):
gemini --approval-mode plan -p "" < "$PROMPT_FILE"
```

### Step 5 — Reconcile

Take the output into the RECONCILE step of the DDV protocol. Classify findings using the same precedence (contract-misread / actionable / trade-off / noise).

### Step 6 — Cleanup

```bash
rm -f "$PROMPT_FILE"
```

## Fallback Hierarchy

1. User's preferred CLI (if specified)
2. Codex CLI (sandbox-aware by design)
3. Gemini CLI
4. Manual paste (user copies artifact to another tool)
5. Skip (announced, not silent)

## Non-Interactive Contexts

- Cross-model is **skipped** and the skip is **announced**: "Cross-model skipped: non-interactive context."
- Never invoke an external CLI without explicit user authorization.

## Anti-Patterns

- Hardcoding a CLI invocation without confirming the tool exists and accepts that syntax
- Passing artifact content as inline `-p "..."` argument (shell injection risk)
- Silently skipping cross-model in interactive mode
- Reusing authorization from a previous invocation
- Running external CLI without read-only sandbox flags
