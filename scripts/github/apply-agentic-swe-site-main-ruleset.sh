#!/usr/bin/env bash
# Apply (create or update) the branch ruleset on agentic-swe/agentic-swe-site for refs/heads/main.
# Required checks match .github/workflows/ci.yml (job id "site", matrix Node 20/22) and main-merge-source.yml.
#
# Prerequisites: gh CLI, logged in with repo admin on agentic-swe-site.
# Usage: from repo root — bash scripts/github/apply-agentic-swe-site-main-ruleset.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RULESET_JSON="$ROOT/scripts/github/agentic-swe-site-main-ruleset.json"
OWNER_REPO="agentic-swe/agentic-swe-site"
RULESET_NAME="$(jq -r .name "$RULESET_JSON")"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found" >&2
  exit 1
fi

EXISTING_ID="$(gh api "repos/${OWNER_REPO}/rulesets" --paginate -q ".[] | select(.name==\"${RULESET_NAME}\") | .id" | head -1)"

if [[ -n "${EXISTING_ID}" ]]; then
  echo "Updating ruleset id=${EXISTING_ID} (${RULESET_NAME})"
  gh api --method PUT "repos/${OWNER_REPO}/rulesets/${EXISTING_ID}" --input "$RULESET_JSON"
else
  echo "Creating ruleset (${RULESET_NAME})"
  gh api --method POST "repos/${OWNER_REPO}/rulesets" --input "$RULESET_JSON"
fi

echo "Done. Verify: https://github.com/${OWNER_REPO}/settings/rules"
