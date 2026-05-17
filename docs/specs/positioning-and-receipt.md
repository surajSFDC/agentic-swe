# Positioning + `/receipt` — Design Spec

**Status:** Draft (2026-05-17) · awaiting approval
**Authors:** Suraj Gupta, design panel synthesis (adversarial, architect, competitive, content, DX subagents)
**Related:** [`docs/the-north-star.md`](../the-north-star.md), [`docs/roadmap.md`](../roadmap.md), [`docs/capabilities-overview.md`](../capabilities-overview.md), [`docs/specs/owai-1.0.md`](./owai-1.0.md)

---

## 1. Problem statement

`agentic-swe` is technically further along than its market awareness suggests. Shipped today: a state-machine pipeline with 3 tracks, 135+ subagents, Doubt-Driven Verification, cross-model panel, Policy-as-Code, replayable worklogs, OWAI spec, AGENTIC_SWE_BENCH scaffold, Context Packs, and per-phase cost attribution. Despite weekly LinkedIn posts, an OSS repo, and a docs site, traction is stuck (~39 LinkedIn followers, low single-digit engagement per post). The closest analog with **no pipeline** — `wshobson/agents` — has 35.5K GitHub stars by simply curating subagents.

A 5-axis review (adversarial, architectural, competitive, content/marketing, DX) converges on three findings:

1. **Three silent failures** are turning every new user away before they see the value: (a) the `SessionStart` hook matcher likely drops the entire Hypervisor policy on real `/work` sessions, (b) `/check artifacts` blocks every legitimate transition by requiring destination-state outputs to exist before the destination phase has run, (c) AGENTIC_SWE_BENCH is empty (`bench/tasks/` has 0 task.json files).
2. **The marketing surface is selling architecture, not outcomes.** "Hypervisor policy · Pure markdown · No cloud runtime" speaks to platform engineers. The Claude Code audience on Twitter/LinkedIn wants `/work add retry logic` → reviewable PR → merge. The docs site is React-rendered, so search engines and AI tools see nothing.
3. **A real wedge is hiding in the codebase.** `state.json.history[]` + `audit.log` + `budget.cost_ledger` together compose a tamper-evident, cost-attributed, per-decision audit trail for AI coding work — that lives in the user's own repo. No hosted competitor (Devin, Cursor, OpenHands, Kiro) can replicate this in 6 months without surrendering state ownership to the customer.

The market is moving toward this wedge: **EU AI Act high-risk provisions take effect August 2026**, **NIST AI Agent Standards Initiative launched February 2026**, OWASP published an Agentic Top 10 in December 2025, and 72% of S&P 500 companies disclosed material AI risk in 2025 while only 26% have governance policies. Agentic-swe already generates the artifacts these audiences need; it just doesn't ship them as a screenshot-able product.

## 2. Strategic thesis (A+B sequenced)

**Primary position (A — The Receipt):**
> "Every AI coding decision, audited. The autonomous SWE pipeline that survives an AI Act review."

**Acquisition channel (B — Magic-PR demo):**
> "Claude codes your PRs. You review and merge. With evidence."

A is the moat (defensible against hosted SaaS competitors, ties to a regulatory deadline). B is the daily-developer hook that gets engineers to install and try it. Devs find the project on Twitter through B, stay for A. C (OWAI as an open standard) is the year-2 protocol moat — out of scope here.

### ICP (in priority order)

| Tier | Persona | Pain | Channel |
|------|---------|------|---------|
| **P0** | Eng lead at a 30-200 person company on Claude Code; reports to a CTO who's nervous about AI | "Legal asked me how we'd audit AI-generated code; I have no answer" | LinkedIn long-form, founder DMs, the Receipt artifact itself |
| **P1** | Solo dev / indie hacker using Claude Code daily | Context-switch burnout; doesn't trust unattended Claude to ship full features | Twitter/X demo videos, dev.to / Hacker News, build-in-public weekly cadence |
| **P2** | Platform / DevEx team at a regulated-industry company (fintech, healthcare, EU) | Procurement is asking for AI governance evidence by Q3 2026 | NIST/OWASP control mapping doc, conference talks, design partners |

### What this thesis explicitly is not

- Not a hosted SaaS. The customer-owned `.worklogs/` is the moat. Adding a cloud runtime kills the differentiation.
- Not "compete with Cursor on autocomplete." Cursor wins the editor surface; we win the lifecycle layer above it.
- Not "compete with Devin on autonomy theater." Devin wins the closed-loop "fire and forget" pitch; we win the "fire, audit, approve" pitch.
- Not a sales-led enterprise motion in 2026. Free, OSS, repo-native. Enterprise comes after the bottom-up dev adoption from B.

## 3. Deliverables

### 3.1 `/receipt` command (the killer artifact)

A new pack command that renders a completed work item as a shareable markdown summary suitable for dropping into a PR description, Slack message, or compliance ticket.

**Command surface**
```
/receipt                  # newest non-completed work item, or most recent completed if none
/receipt <work-id>        # specific work item
/receipt <work-id> --format=html|markdown|json
```

**Inputs (read-only, no new state):**
- `.worklogs/<id>/state.json` (history, budget, pipeline, counters)
- `.worklogs/<id>/audit.log` (delegation trail)
- `.worklogs/<id>/*.md` (phase artifacts — used for evidence citation)
- `references/cross-model-escalation.md`, etc. — for any external review records

**Output (markdown, the default)**

```
# /work add retry logic to the API client

| Field | Value |
|---|---|
| Work ID | add-retry-logic |
| Track | standard |
| Status | completed |
| Duration | 47 min |
| Cost | $1.84 (Claude Sonnet + 1 Codex review) |
| PR | https://github.com/.../pull/142 |

## Decisions made (5)

1. **Feasibility** (3 min, $0.08) — Determined task is **standard** complexity (touched 4 files,
   no schema change). Subagent signals: `node`, `http`. → `feasibility.md`
2. **Design** (12 min, $0.41) — Chose exponential backoff with jitter (3 retries, 5xx only).
   Considered: linear backoff (rejected: thundering herd risk). → `design.md`
3. **Implementation** (18 min, $0.92) — Modified `src/api/client.js` + added
   `src/api/retry.js`. Per-file diff: +84/-12 lines. → `implementation.md`
4. **Validation** (8 min, $0.21) — 12 new tests, all green. Lint passed. Coverage +3.2%.
   → `validation-results.md`
5. **Cross-model review** (4 min, $0.18 → Codex) — Codex confirmed retry policy is correct
   and flagged one minor concern (no upper-bound on jitter), incorporated. → `cross-model-review.md`

## Human gates respected (1)
- `approval-wait` resolved by suraj@example at 2026-05-17T14:32Z (PR approved)

## Loop counters
- `self_review_iter`: 0 (no rework)
- `doubt_cycles`: 1 (DDV invoked at design-review, no actionable findings)
- `code_review_iter`: 0 (no rework)

## Verifiable references
- All artifacts: `.worklogs/add-retry-logic/`
- Audit log: `.worklogs/add-retry-logic/audit.log` (12 entries)
- Reproducible? `node scripts/replay.cjs add-retry-logic` ✓
```

**Implementation notes**
- One new file: `commands/receipt.md` (the slash command prompt).
- One new script: `scripts/render-receipt.cjs` (pure read-only over `.worklogs/<id>/`).
- One test: `test/render-receipt.test.js` (fixture-based, no LLM required).
- Existing data sufficient — no schema change to `state.json` required for v1.
- Future enhancement (out of scope for v1): cryptographic hash of the receipt + signed attestation. Adds the "tamper-evident" claim to the marketing copy. Bookmark as v2.

### 3.2 README rewrite (the front door)

Replace the current README headline + first viewport. The current opening sells architecture; the new opening must sell outcome + show, not tell.

**New headline** (12 words):
> "Claude codes your PRs. You review the receipt. Then merge."

**Sub-headline** (one sentence):
> "An open-source autonomous SWE pipeline that runs in your editor or CI, writes every decision into your repo, and gives you a shareable audit trail of what the AI did and why."

**First viewport order:**
1. Headline + sub-headline (above)
2. Animated demo (terminal recording, ~30 seconds): `/work add retry logic` → state bar updates → PR link → `/receipt` output rendered
3. Single install command block (one path, no toggle): `claude --plugin-dir "$(npx -y @agentic-swe/agentic-swe path)"`
4. Three-line "What it gives you" bullets: structured PRs · cost-attributed decisions · audit trail
5. "Compliance-grade" callout box linking to the NIST/OWASP mapping page (Section 3.3)
6. Then everything that's currently in the README (state machine, tracks, subagents) moves below the fold

Move "Hypervisor policy" terminology out of the user-facing README; keep it only in `CLAUDE.md` (where it's a name for the operating loop, not a marketing claim). Plain English in marketing surfaces; pack-specific vocabulary stays in the pack files.

**Constraints:**
- No new dependencies for the demo recording (use asciinema; check in the `.cast` file + a fallback GIF in `docs/assets/`).
- README total length: ≤ 200 lines for the scannable front page (everything else stays in `docs/`).
- The first command in the README must work copy-paste with one tool installed (Claude Code). Anything that requires npm scope creation or two-step plugin marketplace add goes into the Advanced section.

### 3.3 NIST/OWASP control-mapping doc

A one-page reference doc that maps `.worklogs/` artifacts to common AI governance controls. This is **not a compliance certification** — it's a screenshot for the eng lead to send to their compliance partner.

- New file: `docs/compliance-mapping.md`
- Covers: NIST AI RMF (Govern/Map/Measure/Manage), OWASP Agentic Top 10 (Dec 2025), and a stub for EU AI Act Article 14 (human oversight) and Article 15 (accuracy/robustness/cybersecurity).
- For each control: which artifact in `.worklogs/` provides evidence, and a one-line citation.
- Wired into the site as a top-nav item.

### 3.4 Three pre-positioning bug fixes (in flight in parallel)

The marketing work above presupposes the product works on first install. The three critical bugs identified by the adversarial review are being fixed by parallel developer-agents as this spec is finalized — see Section 5 for status. **No marketing motion ships until these three fixes are merged.**

## 4. Marketing motions (sequencing, weeks 1-6)

| Week | Motion | Asset | Goal |
|------|--------|-------|------|
| 1 | Land the three bug fixes; ship `/receipt` v1 behind a flag | PR merged | unblock everything |
| 1 | Record asciinema cast of `/work` → `/receipt` end-to-end | `docs/assets/receipt-demo.cast` | embed in README |
| 1 | README rewrite | PR merged | first-viewport rehab |
| 2 | LinkedIn long-form post: "I built the audit trail Devin can't ship" | Post + screenshot of `/receipt` | seed P0 ICP |
| 2 | Twitter/X thread: "Show your AI's work. 1 command. Watch." | 6-tweet thread + Loom | seed P1 ICP |
| 3 | dev.to / Medium post: "Ship a feature with Claude in 15 min, with a receipt" | Long-form article | SEO + inbound |
| 3 | Cold DM 10 Claude Code power users (offer 30-min walkthrough) | DM thread → call | discovery + design partners |
| 4 | Publish NIST/OWASP control-mapping page | `docs/compliance-mapping.md` | unlock P2 ICP |
| 4 | Show HN: "Show HN: agentic-swe — autonomous coding agent with a portable audit trail" | HN post | distribution event |
| 5 | Conference / meetup submission (AI Engineer Summit, KubeCon governance track) | CFP | credibility |
| 6 | First case study (real or synthetic from a design partner) | docs/case-study/ | social proof |

## 5. Status of in-flight bug fixes (parallel work)

Three developer-agents are running in background as this spec is committed:

1. **Bug 1 (resolved)** — `hooks/hooks.json` SessionStart matcher was missing `resume`. Hypervisor policy injection was being skipped on every resumed session (`--resume`, `--continue`, `/resume`). Fixed by changing matcher from `startup|clear|compact` to `startup|resume|clear|compact`. Regression test added to `test/install-platform-stubs.test.js`. Full suite green (362/362).
2. **Bug 2 (in flight)** — Artifact enforcement inversion in `scripts/lib/work-engine/artifacts.cjs`. Refactor so requirements are evaluated against the *source* state's outputs, not the destination's. Add end-to-end smoke test that walks lean track happy path.
3. **Bug 3 (in flight)** — Empty `bench/tasks/`. Seed 2-3 minimal tasks (lean/standard/rigorous track coverage) so `scripts/bench/run.cjs` is no longer vaporware.

These three are gates on Week 1 marketing motions. Spec finalization can proceed in parallel.

## 6. Success metrics (90 days)

| Metric | Today (2026-05-17) | 90-day target | Source of truth |
|--------|--------------------|----------------|------------------|
| GitHub stars | 1 | 500 | github.com API |
| LinkedIn company followers | 39 | 1,000 | LinkedIn analytics |
| npm weekly downloads | 55 | 1,500 | npm registry |
| `/receipt` mentions (Twitter/blog) | 0 | 25 | manual + search |
| Design partners (NIST/OWASP-mapping use case) | 0 | 3 | self-reported |
| AGENTIC_SWE_BENCH submissions from third parties | 0 | 1 | PR count |

Star count is the most honest signal here. **1 star with 55 weekly npm downloads** says the small set of people finding the project are installing it but not bookmarking it — consistent with the diagnosis that the README front-door isn't doing acquisition work. The 500-star target is deliberately modest; the goal is repeatable inbound flow, not vanity numbers.

Lagging indicator: a non-author cites `agentic-swe` in a blog post about AI governance or autonomous coding hygiene without prompting. Aim: at least 2 unprompted citations by day 90.

## 7. Out of scope

- Hosted SaaS or cloud runtime (would destroy the moat in Section 2)
- OWAI standards body application (year 2)
- Cryptographic attestation / signed receipts (v2 of `/receipt`)
- New subagent catalog work (catalog is already 135+; growth is not the bottleneck)
- VS Code or JetBrains extension (post-90-day, post-traction)
- New track types (lean/standard/rigorous is enough)
- IDE marketplace listings beyond Claude Code (after Claude Code traction is established)

## 8. Open questions

1. **Receipt artifact format for v1** — markdown is the default, but should we also commit a JSON sidecar so the receipt is machine-parsable (and the OWAI conformance suite could validate it)?
2. **Demo recording tool** — asciinema (terminal-only) vs. Loom (with cursor + voice). Both, or just one for v1?
3. **README installation simplification** — can we get to a true single-command install without the npm scope dance? E.g., a `curl | sh` installer that detects Claude Code's plugin dir and symlinks.
4. **Design partner pipeline** — do we want named design partners (3-5 companies) under NDA before the public push, or run the public push first and let inbound surface them?
5. **Cron persistence** — the in-session brainstorm cron is session-bound. We should also add a script that emits an `crontab` line or a `launchd` plist for true OS-level recurrence. Bookmark or include in Week 1?

---

## Self-review notes (per brainstorming skill)

- **Placeholders:** None. All sections complete with concrete file paths, commands, and counts.
- **Internal consistency:** Section 2 ICP tiers (P0/P1/P2) align with Section 4 marketing motions and Section 6 metrics.
- **Scope check:** This spec is focused enough for a single implementation plan. The plan will cover: (a) the three bug fixes, (b) the `/receipt` command, (c) README rewrite, (d) the NIST/OWASP mapping page, (e) the demo recording, (f) the Week 1-2 launch artifacts. Anything beyond Week 2 is left as roadmap, not implementation.
- **Ambiguity:** Open questions in Section 8 are flagged. Each requires a decision before implementation begins, but none block writing the implementation plan structure.
