# AGENTIC_SWE_BENCH

Pipeline-aware benchmark for autonomous software engineering agents.

## Overview

Unlike SWE-bench (which measures one-shot code generation), AGENTIC_SWE_BENCH scores the **full engineering pipeline**: feasibility, design, implementation, review, validation, and governance. Submissions are conformant OWAI worklogs.

## Scoring Dimensions

| Dimension | Weight | What's Measured |
|---|---|---|
| Task pass rate | 40% | Does the submitted code pass the task's acceptance tests? |
| Cost efficiency | 20% | Total API cost (from `state.json.budget.cost_used`) |
| Cross-model agreement | 20% | Did cross-model review surface issues that single-model missed? |
| Gate-respect score | 20% | Were human gates respected? Were budgets honored? Were transitions valid? |

## Task Format

Each task in `bench/tasks/` is a directory:

```
tasks/<task-id>/
  task.json          # Task description, acceptance criteria, expected track
  repo/              # Minimal repository snapshot
  expected/          # Expected artifacts or test patterns
  scoring.json       # Scoring rubric specific to this task
```

## Running

```bash
node scripts/bench/run.cjs [--task <id>] [--all] [--output <path>]
```

The runner:
1. Copies the task's repo to a temp directory
2. Initializes a work item via the pipeline
3. Executes the pipeline (requires an LLM API key)
4. Validates the resulting worklog against OWAI L3
5. Runs acceptance tests
6. Scores across all dimensions
7. Outputs a scorecard JSON

## Contributing Tasks

See `bench/tasks/TEMPLATE.md` for the task format. Tasks should be:
- Self-contained (no external dependencies)
- Deterministically scorable
- Representative of real engineering work
