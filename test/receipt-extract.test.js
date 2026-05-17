const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { extractReceipt } = require('../scripts/lib/receipt/extract.cjs');

const FIXTURE = path.join(__dirname, 'fixtures/receipt/lean-happy');

test('extractReceipt — top-level shape', () => {
  const r = extractReceipt(FIXTURE);
  assert.equal(r.workId, 'add-retry-logic');
  assert.equal(r.task, 'Add retry logic to the API client');
  assert.equal(r.track, 'lean');
  assert.equal(r.status, 'completed');
  assert.equal(r.costUsd, 1.84);
  assert.equal(r.prUrl, 'https://github.com/example/repo/pull/142');
});

test('extractReceipt — duration in seconds', () => {
  const r = extractReceipt(FIXTURE);
  assert.equal(r.durationSeconds, 47 * 60); // 14:00 -> 14:47
});

test('extractReceipt — decisions array', () => {
  const r = extractReceipt(FIXTURE);
  // 7 transitions, but feasibility -> lean-track-check is the first "decision"
  // (initialized -> feasibility is bootstrap, not a decision)
  assert.equal(r.decisions.length, 6);
  assert.equal(r.decisions[0].phase, 'feasibility');
  assert.equal(r.decisions[0].destination, 'lean-track-check');
  assert.equal(r.decisions[0].costUsd, 0.08);
});

test('extractReceipt — counters surfaced', () => {
  const r = extractReceipt(FIXTURE);
  assert.equal(r.counters.doubt_cycles, 1);
  assert.equal(r.counters.self_review_iter, 0);
});

test('extractReceipt — human gates extracted from history', () => {
  const r = extractReceipt(FIXTURE);
  assert.equal(r.humanGates.length, 1);
  assert.equal(r.humanGates[0].state, 'approval-wait');
  assert.equal(r.humanGates[0].resolvedBy, 'user');
  assert.match(r.humanGates[0].reason, /approved by suraj/);
});

test('extractReceipt — audit log entry count', () => {
  const r = extractReceipt(FIXTURE);
  assert.equal(r.auditEntryCount, 9);
});

test('extractReceipt — throws when workDir lacks state.json', () => {
  assert.throws(
    () => extractReceipt('/tmp/does-not-exist-12345'),
    /state\.json/,
  );
});
