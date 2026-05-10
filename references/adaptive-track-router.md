# Adaptive Track Router (ATR)

An advisory system that recommends lean/standard/rigorous track selection based on past worklogs in the repository.

## How It Works

1. At `lean-track-check`, after computing the heuristic verdict, ATR runs `${CLAUDE_PLUGIN_ROOT}/scripts/lib/router/track-router.cjs` against completed `.worklogs/` entries.
2. ATR tokenizes the current `feasibility.md` and computes TF-IDF cosine similarity against completed worklogs' feasibility artifacts.
3. The top-K most similar completed worklogs vote on the track, weighted by similarity.
4. ATR returns a recommendation with confidence level and average cost from matched worklogs.

## Advisory, Not Authoritative

The ATR recommendation is written to `state.json.pipeline.track_recommendation`:

```json
{
  "track_recommendation": {
    "track": "standard",
    "confidence": "high",
    "evidence_ids": ["work-abc123", "work-def456"],
    "avg_cost": 1.25,
    "reason": "Based on 3 similar completed worklogs"
  }
}
```

The Hypervisor still makes the final track decision. ATR output is one input alongside the heuristic verdict from `lean-track-check.md`.

## Override Semantics

- **Agree with heuristic**: ATR confirms the heuristic — proceed with confidence.
- **Disagree with heuristic**: ATR suggests a different track — the Hypervisor should document why it followed or overrode ATR in `lean-track-check.md`.
- **No data**: ATR has no completed worklogs to compare — fall back to heuristic only.
- **Low confidence**: ATR found matches but similarity was weak — treat as informational.

## Cold Start

Repos with no completed worklogs get `{ track: null, confidence: "none" }`. The heuristic is the sole input. As worklogs accumulate, ATR becomes more useful.

## Privacy

ATR operates entirely locally. Feasibility text and cost data never leave the repository.
