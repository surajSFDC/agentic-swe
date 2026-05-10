# /swe-tui

Launch a terminal-based live cockpit for monitoring pipeline execution.

## Usage

```
/swe-tui [--work-dir <path>] [--cwd <repo-path>]
```

## Behavior

1. Discover the active work item from `.worklogs/` (newest non-completed, or specified via `--work-dir`).
2. Start a terminal UI displaying:
   - **State bar**: current state, track, budget remaining, cost used
   - **History panel**: scrollable list of transitions with timestamps
   - **Gate panel**: active gate prompts (ambiguity-wait, approval-wait) with resolution controls
   - **Event stream**: real-time events from the pipeline (state changes, subagent spawns, doubt findings)
   - **Budget burn**: visual cost/token chart
3. Events are consumed via the dashboard event stream (WebSocket from `swe-dashboard` or file-watch on `state.json`).
4. Gate resolution: when a gate event appears, the TUI prompts the human for input and writes the resolution to the appropriate artifact.

## Constraints

- Read-only by default — gate resolution requires explicit `--interactive` flag.
- Falls back to polling `state.json` every 2 seconds if WebSocket is unavailable.
- Designed for SSH/headless environments where the browser dashboard is not accessible.

## Implementation Notes

Uses Node built-in `readline` for minimal dependency. For richer TUI, `blessed` or `ink` can be added as optional dependencies.
