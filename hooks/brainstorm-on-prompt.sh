#!/usr/bin/env bash
# UserPromptSubmit (async): when the user submits /brainstorm, ensure the local
# brainstorm HTTP/WebSocket server is running (idempotent). Claude Code only.
set -euo pipefail

INPUT=$(cat || true)
if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""' 2>/dev/null || echo "")
# trim leading whitespace
PROMPT_TRIMMED="${PROMPT#"${PROMPT%%[![:space:]]*}"}"

if [[ ! "$PROMPT_TRIMMED" =~ ^/[Bb]rainstorm($|[[:space:]]) ]]; then
  exit 0
fi

ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if [[ -z "$ROOT" ]] || [[ ! -d "$ROOT" ]]; then
  exit 0
fi

SERVER_DIR="$ROOT/agents/plugin-runtime/brainstorm-server"
if [[ ! -d "$SERVER_DIR" ]]; then
  exit 0
fi

PORT="${BRAINSTORM_PORT:-47821}"
if (echo >/dev/tcp/127.0.0.1/"$PORT") >/dev/null 2>&1; then
  exit 0
fi

# Background start: install deps if needed, then listen (see start-server.sh).
nohup bash "$SERVER_DIR/start-server.sh" >/dev/null 2>&1 &
exit 0
