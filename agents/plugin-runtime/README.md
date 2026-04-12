# Plugin runtime (non-agent assets)

This directory holds **supporting tooling** that ships with the plugin but is **not** Hypervisor pipeline agent markdown (`agents/subagents/`, `agents/panel/`, …).

| Path | Role |
|------|------|
| **`brainstorm-server/`** | Optional local HTTP + WebSocket UI for **`/brainstorm`** / design exploration |
| **`subagent-catalog/`** | Shell helpers used by **`/subagent`** (`config.sh`) |

Claude Code discovers plugin agents from **`agents/`** recursively. The **`subagent-catalog/*.md`** files here are **documentation only** (no agent frontmatter) so they are not registered as agents.

When you run **`/brainstorm`**, **`hooks/brainstorm-on-prompt.sh`** (via **`hooks/hooks.json`** → `UserPromptSubmit`, async) starts this server if nothing is already listening on **`BRAINSTORM_PORT`** (default **47821**).
