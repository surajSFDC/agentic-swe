# Branch workflow (this repository)

## Scope (read first)

- This document is **only for people and agents working on the agentic-swe pack repository itself** (this GitHub project: CI, `main` / `uat`, rulesets).
- It is **not** a requirement for **downstream projects** that install or use the **agentic-swe Claude Code plugin**. Those repos follow their own Git process; the Hypervisor pipeline in **`CLAUDE.md`** is about **how to run work items**, not about mandating `uat` branches in every consumer repo.

## Agents: staging and commits

**Do not run `git add` or otherwise stage changes until the user has confirmed** what should be staged (file list or intent) in the current conversation, unless they have **explicitly** asked you to stage or commit in this session.

---

Use the workflow below for **any code or config change** in **this** **agentic-swe** repo on GitHub. It matches rulesets on **`main`** and **`uat`**, and the **`main-merge-source`** workflow: only **`uat`**, **`hotfix/*`**, or **`dependabot/*`** may target **`main`** via PR.

## Branch roles

| Kind | Pattern | Purpose |
|------|---------|---------|
| Release | `main` | Production-ready; **no direct pushes** — merge via PR only. **PRs into `main`** must come from **`uat`** (after UAT) or **`hotfix/*`** (emergency). Enforced by **`.github/workflows/main-merge-source.yml`**. |
| UAT / staging | `uat` | Pre-release integration; **no direct pushes** — merge via PR. Normal work lands here **before** `main`. |
| Feature | `feature/<short-kebab-topic>` | New capability. |
| Bugfix | `bugfix/<short-kebab-topic>` or `bug-fix/<short-kebab-topic>` | Defect fixes. |
| Hotfix | `hotfix/<short-kebab-topic>` | Urgent fix **may PR directly to `main`** (bypasses UAT line). Still run tests before push. |
| Maintenance | `chore/<short-kebab-topic>` | Tooling, CI, docs batches. |

Avoid ad-hoc branch names (`dev`, `temp`, …) unless they use an allowed prefix above.

## Standard flow (not a hotfix)

1. `git fetch origin` and branch from **`origin/main`** (or **`origin/uat`** when appropriate).
2. `git checkout -b feature/my-change` (or `bugfix/…`, `chore/…`).
3. Before **every** push (repo root): **`npm test`**. If you touched **`site/`** (or site tooling): also **`npm run lint --prefix site`** and **`npm run build --prefix site`**.
4. Push and open a PR into **`uat`** (not `main`):

   `gh pr create --base uat --head <your-branch> --title "…" --body "…"`

5. After **UAT passes**, open a **promotion** PR **`uat` → `main`**:

   `gh pr create --base main --head uat --title "Promote uat to main" --body "UAT passed: …"`

## Hotfix flow

1. Branch from **`main`**: `git checkout -b hotfix/critical-fix origin/main`
2. Fix, test (`npm test`, plus site checks if applicable), push.
3. PR **directly to `main`**: `gh pr create --base main --head hotfix/critical-fix …`

## Refresh `uat` from `main`

When `main` has moved ahead and you want **`uat`** to catch up, open a PR with **base `uat`** and **head `main`** (not `git push origin main:uat`).

## Maintainer hygiene (this repo)

- **Git author:** personal project — use **Suraj Gupta** / **`10187486+surajSFDC@users.noreply.github.com`** (or another email verified on **surajSFDC**). Set with `git config` for this repo only; do not use a corporate identity for commits here.
- **npm:** run from repo root so **[`.npmrc`](../.npmrc)** applies (`registry=https://registry.npmjs.org/`).

## GitHub rulesets

| Branch | Notes |
|--------|--------|
| `main` | [Rules](https://github.com/surajSFDC/agentic-swe/rules): PR required, code owners, CI **`test (20)`** / **`test (22)`**, **`main-merge-source`**, no force-push. |
| `uat` | Same style: PR + CI + code owners. |

**Dependabot** heads `dependabot/…` are allowed to target **`main`** by **`main-merge-source`**.

## Hypervisor pipeline (plugin) vs this Git workflow

- **`CLAUDE.md`** describes the **Hypervisor** state machine, phases, and artifacts when the pack runs **inside some project** (plugin installed). That is **orthogonal** to the **branch / UAT / PR rules above**, which exist **only** to govern **this repository’s** GitHub lifecycle.
- Per-work state in a **target** project may live under **`.worklogs/<id>/`** or **`.claude/.work/<id>/`** depending on install; that is **not** the same as “open every PR to `uat`” — the latter applies **here**, not automatically in every plugin consumer repo.
