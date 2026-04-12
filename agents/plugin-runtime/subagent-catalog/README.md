# subagent-catalog (shell helpers)

Shell library used by the pack’s **`/subagent`** command (**`commands/subagent.md`**). It resolves **`agents/subagents/`** from the plugin root and lists, searches, or opens specialist **`.md`** definitions.

## Layout

Bundled at **`${CLAUDE_PLUGIN_ROOT}/agents/plugin-runtime/subagent-catalog/config.sh`**.

## Usage in this repo

Prefer **`/subagent`** (no separate install). From a shell snippet:

```bash
source "${CLAUDE_PLUGIN_ROOT}/agents/plugin-runtime/subagent-catalog/config.sh"
subagent_catalog_search "kubernetes"
```

The **`*.md`** files next to **`config.sh`** are **documentation only** (not Claude plugin agents).

## Optional: forked “catalog skill” layout

If you maintain a separate skill that copies these files into **`commands/`**, update paths to match your install location and keep **`config.sh`** beside the copied markdown.
