# Subagent Catalog — Search (documentation)

Optional reference for the shell helpers in this folder. The supported entry point in the pack is **`/subagent search <query>`**.

Find agents by name, description, or category.

## Input: $ARGUMENTS

## Instructions

### Step 1: Search local agents

```bash
source "${CLAUDE_PLUGIN_ROOT}/agents/plugin-runtime/subagent-catalog/config.sh"
subagent_catalog_search "{{QUERY}}"
```

### Step 2: Format results

Display matches as a table:

```
## Results for "kubernetes"

| Agent | Category | Description |
|-------|----------|-------------|
| kubernetes-specialist | infrastructure | Container orchestration master |
| devops-engineer | infrastructure | CI/CD and automation expert |

> use `/subagent info <name>` to show the full definition
> invoke with: Agent(prompt=agents/subagents/<category>/<name>.md)
```

### Step 3: Handle edge cases

- **no results**: suggest related terms or **`/subagent`** (list flow)
- **too many results**: ask user to narrow the query
- **category match**: show all agents in that category
