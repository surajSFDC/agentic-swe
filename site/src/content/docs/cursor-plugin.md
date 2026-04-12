# Cursor plugin

agentic-swe ships a **Cursor plugin manifest** under [`.cursor-plugin/`](../../.cursor-plugin/) so the same **`commands/`** and **`agents/`** markdown tree Claude Code uses can load inside **Cursor**. The **Hypervisor** policy is still root **`CLAUDE.md`** in the **target git repository** you are editing; per-work state stays under **`.worklogs/<id>/`**.

Official Cursor plugin behavior and UI change over time — treat Cursor’s own docs as authoritative for **where** to click; this page describes **what** this repository provides and a reliable setup order.

## What you get

| Piece | Role |
|-------|------|
| [`.cursor-plugin/plugin.json`](../../.cursor-plugin/plugin.json) | Manifest: **`hooks`** → **`hooks/hooks-cursor.json`**; **`commands/`** and **`agents/`** are discovered at the **repo root** (Cursor default). |
| **`hooks/hooks-cursor.json`** | **Session start** runs [`hooks/session-start`](../../hooks/session-start) so the model receives a short orchestration reminder plus [`references/session-routing-hint.md`](../../references/session-routing-hint.md). |
| **`commands/*.md`** | Same slash-style prompts as the Claude Code pack; in Cursor they appear as **plugin commands** (how you open them depends on the Cursor build — command palette, agent UI, or docs sidebar). |
| **`agents/**/*.md`** | Specialist agent definitions the session can open on demand. |

**Not identical to Claude Code:** Cursor does not use Anthropic’s **`/plugin marketplace`** flow. The **`UserPromptSubmit`** hook that auto-starts the brainstorm visual server (**`hooks/hooks.json`** on Claude) is **not** duplicated in **`hooks-cursor.json`**; on Cursor, start the helper manually if you need the UI (see [`commands/brainstorm.md`](../../commands/brainstorm.md) and [`agents/plugin-runtime/brainstorm-server/`](../../agents/plugin-runtime/brainstorm-server/)).

## Prerequisites

- **Git** repository for the work you want to run the pipeline on (recommended).
- **`bash`** and **`node`** on **`PATH`** for **`hooks/session-start`** (it shells out to `node` to emit JSON for the host). If the hook fails, policy in **`CLAUDE.md`** still applies when the file is in context.

## One-command install (local plugins)

Cursor loads plugins from **`~/.cursor/plugins/local/<name>/`** when that folder is a pack root (contains **`.cursor-plugin/plugin.json`** next to **`commands/`**, **`agents/`**, …). See [Plugins — Test plugins locally](https://cursor.com/docs/plugins.md#test-plugins-locally).

Run **one** of the following, then **restart Cursor** or **Developer: Reload Window**:

```bash
curl -fsSL https://raw.githubusercontent.com/surajSFDC/agentic-swe/main/scripts/install-cursor-plugin.sh | bash
```

From a checkout of this repo (offline-friendly):

```bash
bash scripts/install-cursor-plugin.sh
```

**Symlink a local checkout** (best for developing the pack itself):

```bash
AGENTIC_SWE_PACK_ROOT=/path/to/agentic-swe bash scripts/install-cursor-plugin.sh
```

Overrides: **`AGENTIC_SWE_REPO_URL`**, **`AGENTIC_SWE_REF`** (default clone branch **`main`**), **`CURSOR_LOCAL_PLUGINS_DIR`**.

### Automated `CLAUDE.md` merge (same command)

If **`node`** is on your **`PATH`**, set **`AGENTIC_SWE_TARGET_REPO`** to your **application repository root** when you run the install script. It invokes **[`scripts/merge-claude-policy.js`](../../scripts/merge-claude-policy.js)** and merges this pack’s Hypervisor policy using the same delimiter rules as **[`commands/install.md`](../../commands/install.md)** (create file, append block, or upgrade in place).

```bash
AGENTIC_SWE_TARGET_REPO=/path/to/your-app curl -fsSL https://raw.githubusercontent.com/surajSFDC/agentic-swe/main/scripts/install-cursor-plugin.sh | bash
```

Optional: **`AGENTIC_SWE_AUTO_GITIGNORE=1`** appends **`.worklogs/`** to the target **`.gitignore`** when that line is missing (explicit opt-in; matches the consent rule in **`/install`** for teams that want gitignore by default in automation).

**Standalone merge** (pack already on disk — e.g. after **`--plugin-dir`** or a submodule):

```bash
node /path/to/agentic-swe/scripts/merge-claude-policy.js --pack /path/to/agentic-swe --target /path/to/your-app
```

Per-work folders under **`.worklogs/<id>/`** are still created when you start pipeline work; the merge script only handles **`CLAUDE.md`** (and optional **`.gitignore`**).

## Cursor Marketplace (install from inside Cursor)

To let others install from the **Cursor Marketplace** panel (reviewed listings), submit this Git repository at **[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)**. The manifest follows the [Plugins reference](https://cursor.com/docs/reference/plugins.md) (plugin root = repo root; **`commands/`** and **`agents/`** use default discovery; **`hooks`** points at **`hooks/hooks-cursor.json`**).

## Install the plugin (manual / submodule)

1. **Use a checkout** (clone, fork, or submodule) whose root contains **`.cursor-plugin/`** and the sibling dirs **`commands/`**, **`phases/`**, **`agents/`**, etc.

2. Either run the **one-command install** above, **symlink** that checkout into **`~/.cursor/plugins/local/agentic-swe`**, or open the folder in Cursor’s **install local plugin** flow (wording in Settings varies by version).

3. Open your **target project** (the app or library you are changing) in Cursor — it does **not** need a full copy of the pack unless you prefer vendoring.

**Easy updates:** Add this repo as a **git submodule** inside your target monorepo, set **`AGENTIC_SWE_PACK_ROOT`** to the submodule path, and re-run the install script to refresh the symlink; or rely on **`git pull`** inside **`~/.cursor/plugins/local/agentic-swe`** when you used the default clone.

## Configure the target repository

The plugin loads markdown from the **pack** checkout; the **policy and work state** belong in the repo you are shipping.

1. **Merge Hypervisor policy** into the target repo’s root **`CLAUDE.md`**: use **`AGENTIC_SWE_TARGET_REPO`** with the install script (above), or **`node scripts/merge-claude-policy.js --target …`**, or merge manually per [`commands/install.md`](../../commands/install.md) (same contract as Claude Code **`/install`**).

2. **Work items:** create **`.worklogs/<id>/`** in the **target** repo and maintain **`state.json`** per [`templates/state.json`](../../templates/state.json). Resume by reading **`state.json`** before starting new work (the session-start hint says this too).

3. **Optional:** copy or merge **[`AGENTS.md`](../../AGENTS.md)** into the target root so Codex- or Cursor-style “project rules” align with the same orchestration summary.

4. **Optional:** add **`.cursor/rules`** in the target repo so every chat remembers **`CLAUDE.md`**, **`.worklogs/`**, and pack paths. Start from **[`templates/cursor-rules-stub.md`](../../templates/cursor-rules-stub.md)** (copy-paste stub with a **`PACK_ROOT`** placeholder), or mirror this repo’s **`.cursor/rules/`** (session resume, npm registry, and so on).

## Running the pipeline in Cursor

- There is **no** separate runtime: the **agent session** follows **`CLAUDE.md`**, opens files under the pack root (e.g. **`phases/feasibility.md`**), and writes artifacts under **`.worklogs/<id>/`**.
- **“Slash” commands** in Claude Code map to **markdown command files** here. In Cursor, **open the matching file under `commands/`** (e.g. **`work.md`**, **`check.md`**) or use whatever command picker your Cursor build exposes for the plugin.
- Enforcement habits (**`/check budget`**, **`/check transition`**, **`/check artifacts`**) are the same prompts as in [`commands/check.md`](../../commands/check.md); run them before moving **`state.json`**.
- Tool names may differ from Claude Code; when the host wraps tools differently, use **[`references/copilot-tools.md`](../../references/copilot-tools.md)** (Cursor-adjacent) and the other **`references/*-tools.md`** files as hints.

For command semantics and tracks, see [Usage](usage.md) and [Multi-platform support](multi-platform-support.md).

## Troubleshooting

- **Layout:** **`.cursor-plugin/plugin.json`** lives under **`.cursor-plugin/`**; **`commands/`**, **`agents/`**, **`hooks/`**, and the rest of the pack sit at the **repository root** (Cursor’s plugin root). CI checks paths and hook scripts — **`test/install-platform-stubs.test.js`**.
- **Hooks:** **`hooks/hooks-cursor.json`** must list scripts that exist under **`hooks/`**.
- **Version:** **`.cursor-plugin/plugin.json`** **`version`** is kept in sync with root **`package.json`** for releases.

If something still fails, compare your layout with [Installation](installation.md) and [Troubleshooting](troubleshooting.md).
