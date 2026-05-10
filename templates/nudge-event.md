# Nudge Event

Captured when a human provides a typed nudge during Pair Mode. Each nudge is ingested into `audit.log` and optionally into the memory system.

## Schema

```json
{
  "type": "nudge",
  "timestamp": "ISO-8601",
  "work_id": "<id>",
  "state": "<current pipeline state>",
  "phase": "<phase being executed>",
  "nudge_text": "<human's typed input>",
  "effect": "accepted|rejected|deferred",
  "artifact_changed": "<filename or null>"
}
```

## Usage

In Pair Mode (`state.json.pipeline.pair_mode == true`), the Hypervisor pauses on every state change and presents the current diff to the human. The human types a nudge (guidance, correction, or approval), which is recorded as a nudge event.

## Downstream

- **audit.log**: every nudge is appended with full text
- **memory-import**: nudge corpora can be ingested into `.agentic-swe/memory.sqlite` for future track routing and reflection
- **lessons.json**: nudge patterns inform the adaptive track router over time
