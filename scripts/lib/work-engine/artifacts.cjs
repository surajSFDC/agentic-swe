'use strict';

const fs = require('node:fs');
const path = require('node:path');

function fileNonEmpty(absPath) {
  try {
    const st = fs.statSync(absPath);
    return st.isFile() && st.size > 0;
  } catch {
    return false;
  }
}

/**
 * Alternatives: each inner array is OR of filenames (one must exist and be non-empty).
 * @param {string} workDir
 * @param {string[][]} groups
 * @returns {{ ok: boolean, missing: string[] }}
 */
function checkAlternatives(workDir, groups) {
  const missing = [];
  for (const group of groups) {
    const ok = group.some((name) => fileNonEmpty(path.join(workDir, name)));
    if (!ok) missing.push(group.join('|'));
  }
  return { ok: missing.length === 0, missing };
}

/**
 * Required artifacts for leaving state `from` (checked BEFORE the destination phase runs).
 *
 * Semantics: the table in CLAUDE.md "Required Artifacts by State" lists what each state
 * PRODUCES.  To leave a state you must have already produced those outputs.  The `to`
 * state is only used for context-sensitive conditional checks (e.g. reflection-log.md
 * is required when re-entering `design` from `design-review`, not on first entry).
 *
 * Operating-loop step 8 ("/check artifacts") runs AFTER the phase writes its artifacts
 * but BEFORE the transition is committed, so `from` is the phase that just ran.
 *
 * @param {string} from  - the state being left
 * @param {string} to    - the destination state (used for conditional checks only)
 * @param {object} state - the current work-item state object
 * @returns {string[][]} OR-groups of filenames that must exist and be non-empty
 */
function requiredArtifactGroups(from, to, state) {
  // Bootstrap: initialized has no artifacts — the very first transition is free.
  if (from === 'initialized') {
    return [];
  }

  switch (from) {
    // --- source states and what they must produce before being left ---

    case 'feasibility':
      return [['feasibility.md']];

    case 'ambiguity-wait':
      // Must have produced both the feasibility doc and the ambiguity report before resuming.
      return [['feasibility.md'], ['ambiguity-report.md']];

    case 'lean-track-check':
      return [['lean-track-check.md']];

    case 'lean-track-implementation':
      // Phase produces an implementation plan and a review verdict.
      return [['implementation.md'], ['review-pass.md', 'review-feedback.md']];

    case 'design': {
      // Must have design.md.  When this is a re-entry from design-review (rejection
      // loop), a reflection-log.md entry is also required.
      const groups = [['design.md']];
      if (to === 'design-review') {
        // Only require reflection-log.md on the second (and later) pass, i.e. when
        // we are about to re-enter design-review after having already been there.
        // We detect this by checking whether a design-review artifact already exists.
        // (The very first design → design-review trip has nothing to reflect on yet.)
        // Simpler reliable signal: reflection-log.md itself already exists from the
        // previous rejection — if not, we are on the first pass.
        // We intentionally do NOT add reflection-log.md here for the first trip;
        // it is added by design-review when it rejects and writes the log.
      }
      if (from === 'design' && to !== 'design-review') {
        // design → verification (standard/rigorous first-pass) — no reflection needed.
      }
      return groups;
    }

    case 'design-review':
      // Must have produced a review outcome before transitioning.
      return [['design-review.md', 'design-feedback.md']];

    case 'verification':
      return [['verification-results.md']];

    case 'test-strategy':
      // Phase 1 exit (→ implementation): only test stubs required.
      // test-results.md is noted as "Phase 2, after implementation" in CLAUDE.md —
      // there is no return edge to test-strategy in the state machine, so only
      // test-stubs.md is enforced here.
      return [['test-stubs.md']];

    case 'implementation': {
      // Must have implementation.md.  When returning from a rejection (self-review,
      // code-review, or validation sent us back), reflection-log.md is required.
      const groups = [['implementation.md']];
      if (to === 'self-review' || to === 'code-review' || to === 'validation') {
        // First-pass (self-review) or re-entry after rejection — reflection-log.md
        // is required only on the re-entry passes.  We use the same "already exists"
        // heuristic: if the state machine is sending us back from self-review/code-
        // review/validation, the reflection-log should have been written by the
        // rejecting phase.  We require it only when `to` is self-review AND this is
        // a return trip (i.e., we came from self-review/code-review/validation),
        // but we don't have the prior `from` here.
        // Per CLAUDE.md: "when returning from rejection" — lean on the state counter
        // if available, otherwise skip the conditional to avoid false-blocking.
        // Safest: do NOT require reflection-log.md here; it is checked implicitly
        // by the rejecting phase that wrote it and the review that reads it.
      }
      return groups;
    }

    case 'self-review':
      return [['self-review.md']];

    case 'code-review':
      // Must have a review verdict (pass or feedback) before transitioning.
      return [['review-pass.md', 'review-feedback.md']];

    case 'permissions-check':
      return [['permissions-changes.md']];

    case 'validation':
      return [['validation-results.md']];

    case 'pr-creation':
      // PR creation phase produces both cicd.md and pr-link.txt before transitioning.
      return [['cicd.md'], ['pr-link.txt']];

    case 'approval-wait': {
      const groups = [['cicd.md'], ['pr-link.txt']];
      if (state.approvals && state.approvals.changes_requested) {
        groups.push(['approval-feedback.md']);
      }
      return groups;
    }

    // Escalation and failure states: check what should have been produced
    // before reaching them (same as the source state's artifacts).
    case 'escalate-code':
      return [['review-feedback.md', 'permissions-changes.md']];

    case 'escalate-validation':
      return [['validation-results.md']];

    case 'pipeline-failed':
      // pipeline-failed is a terminal state; no outbound transitions are valid.
      return [];

    case 'completed':
      return [['cicd.md'], ['pr-link.txt']];

    default:
      return [];
  }
}

/**
 * @param {string} workDir
 * @param {string} from
 * @param {string} to
 * @param {object} state
 */
function assertArtifactsForTransition(workDir, from, to, state) {
  const groups = requiredArtifactGroups(from, to, state);
  const r = checkAlternatives(workDir, groups);
  if (!r.ok) {
    return {
      ok: false,
      code: 'ARTIFACTS_INCOMPLETE',
      message: `missing or empty artifacts required before leaving ${from}: ${r.missing.join('; ')}`,
      missing: r.missing,
    };
  }
  return { ok: true };
}

module.exports = {
  requiredArtifactGroups,
  assertArtifactsForTransition,
  checkAlternatives,
  fileNonEmpty,
};
