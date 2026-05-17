# Launch checklist — Weeks 1-2

**Source spec:** `docs/specs/positioning-and-receipt.md`

## Pre-launch verification

- [ ] All Phase 0 bug fixes are merged to `main`
- [ ] `/receipt` works against a real `.worklogs/` directory (tested with `tui-mascot-sf-agents/`)
- [ ] README first viewport renders correctly on github.com
- [ ] `docs/compliance-mapping.md` is linked from the new README
- [ ] Asciinema cast plays in the embedded README link
- [ ] LinkedIn post draft below has been peer-reviewed by at least 1 person
- [ ] Twitter thread draft below has been peer-reviewed by at least 1 person

## LinkedIn long-form (P0 ICP — eng leads + compliance)

**Headline:** "I built the AI coding audit trail Devin can't ship"

**Draft:**

> Every AI coding tool — Devin, Cursor, Copilot, Claude Code — has the same problem when the work matters:
>
> Your eng lead doesn't know what the AI decided, why, or what it cost.
>
> So I built agentic-swe: an open-source pipeline that wraps Claude Code with a state machine, evidence artifacts, and human gates. Every decision lands in your repo as `state.json` + `audit.log` + a phase-by-phase markdown trail.
>
> Then I added `/receipt` — one command that renders the whole thing as a shareable markdown summary. Drop it in your PR description, send it to your compliance partner, or paste it in a code review.
>
> Here's what a finished work item looks like:
>
> [embed: sample receipt screenshot]
>
> EU AI Act Article 14 (human oversight) and Article 15 (logging) go into effect August 2026. NIST published their AI Agent Standards initiative in February. If you're going to ship AI-generated code at a regulated company, you'll need to show your work.
>
> agentic-swe was already doing this. `/receipt` is the screenshot.
>
> Free, open source, MIT. Plugin install in Claude Code — link in comments.

**Asset:** screenshot of `docs/assets/sample-receipt.md` rendered on github.com.

## Twitter / X thread (P1 ICP — solo devs)

1. New: agentic-swe just shipped /receipt — a portable, shareable audit trail for every AI coding session. 🧵
2. The problem: AI ships code, you ship the PR — but nobody can tell what the AI decided, why, or what it cost. 1 week later it's a black box.
3. The fix: every transition in agentic-swe writes state.json + audit.log + evidence into .worklogs/<id>/ in YOUR repo. No cloud, no lock-in.
4. /receipt renders it as a markdown summary — drop into PR descriptions, Slack, or your compliance ticket: [embed: cast]
5. Plus: state machine (lean / standard / rigorous tracks), 135+ specialist subagents auto-selected per task, Doubt-Driven Verification, cross-model panel review.
6. EU AI Act ships Aug 2026. NIST AI Agent Standards launched Feb 2026. You're going to need this.
7. OSS / MIT / Claude Code plugin: github.com/agentic-swe/agentic-swe — first PR in this thread 👇

**Asset:** the asciinema cast (link or GIF inline).

## dev.to article outline

**Title:** "Ship a feature with Claude in 15 minutes — with a receipt"

**Sections (write Week 2):**
1. The problem — context-switch tax + AI code with no provenance
2. What agentic-swe is — pipeline + tracks + subagents + audit (skim)
3. Walk-through — `/work add retry logic`, watch state bar, gate at PR, `/receipt` at end
4. The receipt — what's in it, why it matters (NIST/OWASP context)
5. Try it — copy-paste install, links to spec + compliance mapping

## Cold DM list (P1 ICP — 10 Claude Code power users)

Find via: Twitter searches for "claude code" + power users; GitHub stars on related repos; Anthropic's Discord.

**DM template:**

> Hi [name] — saw your [X post / GitHub repo / blog]. Built something that might save you hours each week if you use Claude Code: an OSS pipeline that gives every /work session a portable audit trail you can drop into a PR description. 30-second demo: [cast link]. Curious if you'd find it useful — happy to do a quick walkthrough.

## Show HN

**Title:** "Show HN: Agentic SWE — autonomous Claude Code pipeline with a portable audit trail"

**Body (Week 4):**

> Hi HN — I'm Suraj, and I just shipped agentic-swe v3.3 with /receipt. It's an OSS pipeline that wraps Claude Code in a state machine, evidence artifacts, and human gates — so every AI coding session produces a shareable audit trail in your own repo.
>
> The killer feature is /receipt: one command that renders state.json + audit.log + phase artifacts as a markdown summary. Drop it in your PR description, send it to your compliance team, etc.
>
> Why now: EU AI Act Article 14/15 hits Aug 2026, NIST AI Agent Standards launched Feb 2026. Every team running AI-generated code into prod will need this.
>
> Free, MIT, no cloud runtime. Plugin install in Claude Code (or npm bin for any host).
>
> Repo: [link] · Spec: [link] · Compliance mapping: [link] · 30-sec demo: [cast link]

## Open follow-ups

- [ ] Record asciinema cast (`docs/assets/receipt-demo.cast`) — requires a real terminal session; not done in plan execution
- [ ] Replace GIF with a real Loom if asciinema-to-GIF conversion is rough
- [ ] Email Anthropic devrel about a "Built with Claude Code" feature
- [ ] CFP for AI Engineer Summit + KubeCon governance track (Week 5)
- [ ] First case study writeup (Week 6, after a design partner uses it)

## Metrics tracking (90 days, per spec §6)

| Metric | Today (2026-05-17) | 90-day target | Source of truth |
|--------|--------------------|----------------|------------------|
| GitHub stars | 1 | 500 | github.com API |
| LinkedIn company followers | 39 | 1,000 | LinkedIn analytics |
| npm weekly downloads | 55 | 1,500 | npm registry |
| `/receipt` mentions (Twitter/blog) | 0 | 25 | manual + search |
| Design partners (NIST/OWASP-mapping use case) | 0 | 3 | self-reported |
| AGENTIC_SWE_BENCH submissions from third parties | 0 | 1 | PR count |

Lagging indicator: a non-author cites `agentic-swe` in a blog post about AI governance or autonomous coding hygiene without prompting. Aim: at least 2 unprompted citations by day 90.
