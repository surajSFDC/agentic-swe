# Subagent Catalog — List (documentation)

Optional reference for the shell helpers in this folder. The supported entry point in the pack is **`/subagent`** (see **`commands/subagent.md`**), which sources **`config.sh`** directly.

Browse all available categories and agents from the local subagent catalog.

## Input: $ARGUMENTS

No arguments required.

## Instructions

### Step 1: List categories and agents

```bash
source "${CLAUDE_PLUGIN_ROOT}/agents/plugin-runtime/subagent-catalog/config.sh"

for category in $(subagent_catalog_list_categories); do
  echo "### $category"
  subagent_catalog_list_agents_in "$category" | tr '\n' ', ' | sed 's/,$/\n/'
  echo ""
done
```

### Step 2: Format output

Display as a scannable list:

```
## Subagent Catalog (Local)

### core-development
api-designer, backend-developer, frontend-developer, fullstack-developer, ...

### language-specialists
typescript-pro, python-pro, rust-engineer, golang-pro, ...

[...continue for all 10 categories...]
```

### Tips

- use **`/subagent search <query>`** to filter by keyword
- use **`/subagent info <name>`** to show a full definition
- agents are stored locally in **`agents/subagents/`**
