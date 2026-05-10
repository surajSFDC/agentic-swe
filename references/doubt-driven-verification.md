# Doubt-Driven Verification (DDV)

A bounded, in-flight adversarial review protocol for non-trivial decisions. DDV is a sub-routine invocable from `design-review`, `code-review`, and `validation`, or ad-hoc via `/doubt`.

## When to Invoke

A decision is **non-trivial** when at least one holds:

- Introduces or modifies branching logic
- Crosses a module or service boundary
- Asserts a property the type system cannot verify (thread safety, idempotence, ordering)
- Correctness depends on context the future reader cannot see
- Blast radius is irreversible (production deploy, data migration, public API)

**Do NOT invoke** for mechanical operations (renames, formatting), obvious one-liners, or when the user explicitly prioritizes speed.

## The Five-Step Protocol

```
CLAIM → EXTRACT → DOUBT → RECONCILE → STOP
```

### Step 1 — CLAIM

Name the decision in two or three lines:

```
CLAIM: "<concrete assertion about the artifact>"
WHY THIS MATTERS: "<consequence of being wrong>"
```

If you cannot write the claim compactly, you have a vibe, not a decision. Surface it before scrutinizing it.

### Step 2 — EXTRACT

Produce the **smallest reviewable unit**:

- **Code**: the diff or function — not the whole file
- **Decision**: the proposal in 3–5 sentences plus constraints
- **Assertion**: the claim plus the evidence that supposedly supports it

**Strip your reasoning.** If you hand over conclusions, you get back validation of your conclusions.

### Step 3 — DOUBT

Spawn a fresh-context reviewer with an **adversarial prompt** (see `${CLAUDE_PLUGIN_ROOT}/agents/prompts/adversarial-reviewer-prompt.md`).

**Pass ARTIFACT + CONTRACT only. Do NOT pass the CLAIM.** Handing the reviewer your conclusion biases it toward agreement. The reviewer must independently determine whether the artifact satisfies the contract.

Within Claude Code, use the panel agents or a Task subagent. For cross-model escalation, see `${CLAUDE_PLUGIN_ROOT}/references/cross-model-escalation.md`.

### Step 4 — RECONCILE

The reviewer's output is data, not verdict. **You are still the orchestrator.** Re-read the artifact against each finding before classifying.

Classification precedence (first matching class wins):

1. **Contract misread** — reviewer flagged something because the CONTRACT was unclear. Fix the contract, re-classify next cycle.
2. **Valid + actionable** — real issue requiring an artifact change. Change it, re-loop.
3. **Valid trade-off** — issue is real but cost of fixing exceeds cost of accepting. Document the trade-off explicitly.
4. **Noise** — reviewer flagged something correct under context it lacked. Note it, move on.

### Step 5 — STOP

Stop when:

- Next iteration returns only trivial or already-considered findings, **or**
- 3 cycles completed (escalate to user — do not grind a fourth alone), **or**
- User explicitly says "ship it"

If 3 cycles still surface substantive issues, the artifact is not ready. Surface this to the user.

## Anti-Doubt-Theater Detector

**Doubt theater**: across 2+ cycles where the reviewer surfaced substantive findings, zero findings were classified as actionable. You are validating, not doubting. **Stop and escalate immediately.**

The `state.json.counters.doubt_cycles` counter tracks invocations. The Hypervisor must not exceed 3 without escalation.

## Integration with Phases

| Phase | Trigger | Scope |
|---|---|---|
| `design-review` | Before finalizing verdict on non-trivial design decisions | Design artifact + acceptance criteria contract |
| `code-review` | Before approving code that crosses boundaries or has irreversible effects | Diff + design spec contract |
| `validation` | When a validation claim cannot be trivially verified by test output alone | Claim + evidence contract |

## Interaction with Other Capabilities

- **Cross-model escalation** (`references/cross-model-escalation.md`): DDV Step 3 can use cross-model review for higher assurance
- **Verification standard** (`references/verification-standard.md`): DDV findings feed into evidence requirements
- **Reflection log**: DDV findings that result in artifact changes should be noted in `reflection-log.md` for future reference
