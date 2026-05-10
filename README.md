<h1 align="center">Agentic SWE</h1>

<p align="center"><strong>Hypervisor policy · Pure markdown · No cloud runtime</strong></p>

<p align="center">
  <a href="https://github.com/agentic-swe/agentic-swe/actions/workflows/ci.yml"><img src="https://github.com/agentic-swe/agentic-swe/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-3.2.0-orange.svg" alt="Version" /></a>
  <a href="#subagents"><img src="https://img.shields.io/badge/subagents-135%2B-purple.svg" alt="Agents" /></a>
  <a href="https://agentic-swe.github.io/agentic-swe-site/"><img src="https://img.shields.io/badge/docs-site-informational.svg" alt="Docs site" /></a>
</p>

**Policy-driven autonomous engineering:** a **state-machine pipeline** (lean / standard / rigorous), **human gates**, **evidence-backed artifacts** in **`.worklogs/<id>/`**, and **135+ specialists** chosen from repo signals. Everything is **markdown in your repo** — not a hosted runner.

**Docs:** [agentic-swe.github.io/agentic-swe-site](https://agentic-swe.github.io/agentic-swe-site/)

---

## Pipeline at a glance

After **feasibility**, **`lean-track-check`** sets **`pipeline.track`** in **`state.json`**. Tracks merge into **PR creation** → **`approval-wait`** → **completed**.

```mermaid
%%{init: {'theme': 'dark', 'fontFamily': 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'}}%%
flowchart TD
    start(["/work — start or resume"])
    feasibility["feasibility"]
    check{"lean-track-check<br/>sets pipeline.track"}
    lean["Lean track<br/>lean-track-implementation<br/>validation · pr-creation"]
    std["Standard track<br/>design → verification → test-strategy<br/>implementation → self-review<br/>validation · pr-creation"]
    rig["Rigorous track<br/>design → design-review<br/>verification → test-strategy<br/>implementation → self-review<br/>code-review → permissions-check<br/>validation · pr-creation"]
    gate{{"approval-wait<br/>human gate"}}
    done(["completed"])

    start --> feasibility --> check
    check -->|lean| lean
    check -->|standard| std
    check -->|rigorous| rig
    lean --> gate
    std --> gate
    rig --> gate
    gate --> done

    classDef accent fill:#1f6feb,stroke:#58a6ff,color:#ffffff,stroke-width:2px
    classDef step fill:#21262d,stroke:#30363d,color:#e6edf3,stroke-width:1px
    classDef branch fill:#21262d,stroke:#388bfd,color:#c9d1d9,stroke-width:2px
    classDef decide fill:#21262d,stroke:#d29922,color:#ffdfb8,stroke-width:2px
    classDef gateNode fill:#21262d,stroke:#a371f7,color:#e6edf3,stroke-width:2px

    class start,done accent
    class feasibility step
    class check decide
    class lean,std,rig branch
    class gate gateNode
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
<summary><strong>npm (pack path for any host)</strong></summary>

Install the published tarball globally (scoped package — the unscoped **`agentic-swe`** name on npm is a different project):

```bash
npm install -g @agentic-swe/agentic-swe --registry=https://registry.npmjs.org/
```

Print the pack root, then point Claude Code or scripts at it:

```bash
agentic-swe path
# claude --plugin-dir "$(agentic-swe path)"
```

Maintainers: **`docs/PUBLISHING.md`** — **First time on npm:** create the **`@agentic-swe`** organization on the registry before **`npm publish`** ([details](docs/PUBLISHING.md#first-time-on-npm-create-the-scope)).

</details>

<details>
<summary><strong>Cursor</strong></summary>

```bash
curl -fsSL https://raw.githubusercontent.com/agentic-swe/agentic-swe/main/scripts/install-cursor-plugin.sh | bash
```

From an **npm** global install, symlink the pack into Cursor’s local plugins dir:

```bash
export AGENTIC_SWE_PACK_ROOT="$(agentic-swe path)"
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
%%{init: {'theme': 'dark', 'fontFamily': 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'}}%%
flowchart LR
    subgraph wl[".worklogs / &lt;id&gt; /"]
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
        core --- art
    end

    classDef file fill:#21262d,stroke:#58a6ff,color:#e6edf3,stroke-width:1px

    class s,p,a,f1,f2,f3,f4 file

    style wl fill:#0d1117,stroke:#30363d,color:#58a6ff
    style core fill:#161b22,stroke:#388bfd,color:#8b949e
    style art fill:#161b22,stroke:#388bfd,color:#8b949e
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
%%{init: {'theme': 'dark', 'fontFamily': 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'}}%%
flowchart TB
    subgraph hv["Hypervisor session"]
        pol["CLAUDE.md<br/>state machine · gates · delegation"]
    end

    subgraph core["Core agents"]
        direction TB
        d["developer-agent"]
        g["git-operations-agent"]
        m["pr-manager-agent"]
    end

    subgraph panel["Design panel · rigorous track"]
        direction TB
        ar["architect-reviewer"]
        sr["security-reviewer"]
        adv["adversarial-reviewer"]
    end

    subgraph cat["Specialists"]
        catalog["135+ subagents<br/>auto-select · advisory"]
    end

    hv --> core
    hv --> panel
    core -.->|consult| catalog
    panel -.->|consult| catalog

    classDef hyper fill:#1f6feb,stroke:#58a6ff,color:#ffffff,stroke-width:2px
    classDef agent fill:#21262d,stroke:#3fb950,color:#aff5b4,stroke-width:1px
    classDef panelN fill:#21262d,stroke:#d29922,color:#ffdfb8,stroke-width:1px
    classDef catalogN fill:#21262d,stroke:#a371f7,color:#dbb7ff,stroke-width:2px

    class pol hyper
    class d,g,m agent
    class ar,sr,adv panelN
    class catalog catalogN

    style hv fill:#0d1117,stroke:#30363d,color:#58a6ff
    style core fill:#161b22,stroke:#238636,color:#8b949e
    style panel fill:#161b22,stroke:#d29922,color:#8b949e
    style cat fill:#161b22,stroke:#a371f7,color:#8b949e
```

---

## Extending · CI · License

| Topic | Where |
|-------|--------|
| Extend pipeline | **`/author-pipeline`** · [`references/authoring-pipeline-capabilities.md`](references/authoring-pipeline-capabilities.md) |
| CI | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — **`npm run ci`** locally |
| Research basis | [`CLAUDE.md` — Research basis](CLAUDE.md#research-basis) |
| License | [MIT](LICENSE) · [Licensing](https://agentic-swe.github.io/agentic-swe-site/docs/licensing) |
