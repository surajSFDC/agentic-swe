<h1 align="center">Agentic SWE</h1>

<p align="center"><strong>Hypervisor policy · Pure markdown · No cloud runtime</strong></p>

<p align="center">
  <a href="https://github.com/agentic-swe/agentic-swe/actions/workflows/ci.yml"><img src="https://github.com/agentic-swe/agentic-swe/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-3.1.1-orange.svg" alt="Version" /></a>
  <a href="#subagents"><img src="https://img.shields.io/badge/subagents-135%2B-purple.svg" alt="Agents" /></a>
  <a href="https://agentic-swe.github.io/agentic-swe-site/"><img src="https://img.shields.io/badge/docs-site-informational.svg" alt="Docs site" /></a>
</p>

**Policy-driven autonomous engineering:** a **state-machine pipeline** (lean / standard / rigorous), **human gates**, **evidence-backed artifacts** in **`.worklogs/<id>/`**, and **135+ specialists** chosen from repo signals. Everything is **markdown in your repo** — not a hosted runner.

**Docs:** [agentic-swe.github.io/agentic-swe-site](https://agentic-swe.github.io/agentic-swe-site/)

---

## Pipeline at a glance

After **feasibility**, **`lean-track-check`** sets **`pipeline.track`** in **`state.json`**. Tracks merge into **PR creation** → **`approval-wait`** → **completed**.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif', 'fontSize': '15px', 'primaryColor': '#1d4ed8', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#1e3a8a', 'secondaryColor': '#f1f5f9', 'secondaryTextColor': '#0f172a', 'secondaryBorderColor': '#64748b', 'tertiaryColor': '#fef3c7', 'tertiaryTextColor': '#422006', 'tertiaryBorderColor': '#b45309', 'lineColor': '#334155', 'textColor': '#0f172a', 'mainBkg': '#ffffff', 'clusterBkg': '#f8fafc', 'clusterBorder': '#94a3b8', 'titleColor': '#0f172a', 'edgeLabelBackground': '#ffffff'}}}%%
flowchart TD
    start(["/work — start or resume"])
    start --> feasibility["feasibility"]

    feasibility --> check{"lean-track-check<br/>sets pipeline.track"}

    check -->|"lean"| lean["Lean track<br/>────────────<br/>lean-track-implementation<br/>validation<br/>pr-creation"]
    check -->|"standard"| std["Standard track<br/>────────────<br/>design → verification<br/>test-strategy → implementation<br/>self-review → validation<br/>pr-creation"]
    check -->|"rigorous"| rig["Rigorous track<br/>────────────<br/>design → design-review<br/>verification → test-strategy<br/>implementation → self-review<br/>code-review → permissions-check<br/>validation → pr-creation"]

    lean --> gate{{"approval-wait<br/>human gate"}}
    std --> gate
    rig --> gate

    gate --> done(["completed"])
```

Canonical transitions: **`state-machine.json`** and the fenced graph in **`CLAUDE.md`** (checked in CI).

---

## Install & first run

<details>
<summary><strong>Claude Code</strong> (recommended)</summary>

```text
/plugin marketplace add agentic-swe/agentic-swe
/plugin install agentic-swe@agentic-swe-catalog
```

Local pack: `claude --plugin-dir /path/to/agentic-swe`

```text
/work Add retry logic to the API client
```

Use **`/install`** once to merge **`CLAUDE.md`** and optional **`.gitignore`** for `.worklogs/`.

→ [Installation](https://agentic-swe.github.io/agentic-swe-site/docs/installation) · [Claude Code plugin](https://agentic-swe.github.io/agentic-swe-site/docs/claude-code-plugin)

</details>

<details>
<summary><strong>Cursor</strong></summary>

```bash
curl -fsSL https://raw.githubusercontent.com/agentic-swe/agentic-swe/main/scripts/install-cursor-plugin.sh | bash
```

Optional: `AGENTIC_SWE_TARGET_REPO=/path/to/app` on the same line (needs **Node**) to merge **`CLAUDE.md`**.

→ [Cursor plugin](https://agentic-swe.github.io/agentic-swe-site/docs/cursor-plugin)

</details>

<details>
<summary><strong>Codex · OpenCode · Gemini CLI</strong></summary>

| Host | Pointer |
|------|---------|
| **Codex** | [`.codex/INSTALL.md`](.codex/INSTALL.md) · [Codex doc (site repo)](https://github.com/agentic-swe/agentic-swe-site/blob/main/src/content/docs/README.codex.md) |
| **OpenCode** | [`.opencode/`](.opencode/) · [OpenCode doc (site repo)](https://github.com/agentic-swe/agentic-swe-site/blob/main/src/content/docs/README.opencode.md) |
| **Gemini CLI** | `gemini-extension.json` · **`GEMINI.md`** |

</details>

**~15 minutes:** [Golden path](https://agentic-swe.github.io/agentic-swe-site/docs/golden-path)

---

## Commands

| Command | Role |
|---------|------|
| `/work` | Start or resume a work item |
| `/plan-only` | Feasibility / design without implementation |
| `/brainstorm` | Design-first exploration (optional UI server) |
| `/write-plan` · `/execute-plan` | Plan bar then execution |
| `/check budget` · `/check transition` · `/check artifacts` | Enforcement before phases / transitions |
| `/subagent` | Browse / invoke specialists |
| `/repo-scan` · `/test-runner` · `/lint` | Evidence helpers |

**Full list:** [Usage](https://agentic-swe.github.io/agentic-swe-site/docs/usage) · **`commands/`**

---

## Subagents

Under **`agents/subagents/`**. **Auto-selected** from **`feasibility.md`** signals; manual **`/subagent invoke`** anytime.

| Category | Count |
|----------|------:|
| Language Specialists | 29 |
| Infrastructure | 16 |
| Quality & Security | 14 |
| Data & AI | 13 |
| Developer Experience | 13 |
| Specialized Domains | 12 |
| Business & Product | 11 |
| Core Development | 10 |
| Meta & Orchestration | 10 |
| Research & Analysis | 7 |

**Details:** [Subagent catalog](https://agentic-swe.github.io/agentic-swe-site/docs/subagent-catalog) · [Catalog routing](https://agentic-swe.github.io/agentic-swe-site/docs/catalog-routing)

---

## Work state & principles

**`.worklogs/<id>/`** holds **`state.json`** (source of truth), **`progress.md`**, **`audit.log`**, and phase markdown files.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif', 'fontSize': '15px', 'primaryColor': '#1d4ed8', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#1e3a8a', 'secondaryColor': '#f1f5f9', 'secondaryTextColor': '#0f172a', 'secondaryBorderColor': '#64748b', 'lineColor': '#334155', 'textColor': '#0f172a', 'mainBkg': '#ffffff', 'clusterBkg': '#f8fafc', 'clusterBorder': '#94a3b8', 'titleColor': '#0f172a', 'edgeLabelBackground': '#ffffff'}}}%%
flowchart TB
    subgraph wl[".worklogs / &lt;id&gt; /"]
        direction LR
        subgraph core["Core files"]
            direction TB
            s["state.json<br/>current_state · track · budgets"]
            p["progress.md<br/>timeline"]
            a["audit.log<br/>append-only"]
        end
        subgraph art["Examples of phase artifacts"]
            direction TB
            f1["feasibility.md"]
            f2["implementation.md"]
            f3["validation-results.md"]
            f4["pr-link.txt"]
        end
    end

    core --- art
```

- **State over chat** — resume from files, not from thread memory alone.
- **Evidence** — tie claims to commands, paths, or CI (`templates/evidence-standard.md`).
- **CI parity** — **`scripts/work-engine.cjs`** can enforce **`/check`**-style rules.

---

## Repository layout

```
agentic-swe/
├── commands/ phases/ agents/ templates/ references/
├── scripts/          # work-engine, catalog, memory, dashboard, …
├── hooks/ config/ schemas/
├── state-machine.json
├── CLAUDE.md         # Hypervisor policy (canonical with state-machine.json)
├── AGENTS.md GEMINI.md
└── test/
```

---

## Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif', 'fontSize': '15px', 'primaryColor': '#1d4ed8', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#1e3a8a', 'secondaryColor': '#f1f5f9', 'secondaryTextColor': '#0f172a', 'secondaryBorderColor': '#64748b', 'tertiaryColor': '#ecfdf5', 'tertiaryTextColor': '#064e3b', 'tertiaryBorderColor': '#047857', 'lineColor': '#334155', 'textColor': '#0f172a', 'mainBkg': '#ffffff', 'clusterBkg': '#f8fafc', 'clusterBorder': '#94a3b8', 'titleColor': '#0f172a', 'edgeLabelBackground': '#ffffff'}}}%%
flowchart TB
    subgraph hv["Hypervisor session"]
        pol["CLAUDE.md<br/>state machine · gates · delegation"]
    end

    subgraph core["Core agents"]
        direction LR
        d["developer-agent"]
        g["git-operations-agent"]
        m["pr-manager-agent"]
    end

    subgraph panel["Design panel · rigorous track"]
        direction LR
        ar["architect"]
        sr["security"]
        adv["adversarial"]
    end

    subgraph cat["Specialists"]
        catalog["135+ subagents<br/>auto-select · advisory"]
    end

    hv --> core
    hv --> panel
    core -.->|consult| catalog
    panel -.->|consult| catalog
```

---

## Extending · CI · License

| Topic | Where |
|-------|--------|
| Extend pipeline | **`/author-pipeline`** · [`references/authoring-pipeline-capabilities.md`](references/authoring-pipeline-capabilities.md) |
| CI | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — **`npm run ci`** locally |
| Research basis | [`CLAUDE.md` — Research basis](CLAUDE.md#research-basis) |
| License | [MIT](LICENSE) · [Licensing](https://agentic-swe.github.io/agentic-swe-site/docs/licensing) |
