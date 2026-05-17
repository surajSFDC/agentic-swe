const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { extractReceipt } = require('../scripts/lib/receipt/extract.cjs');
const { formatMarkdown, formatJson, formatDurationHuman, formatCost } = require('../scripts/lib/receipt/format.cjs');

const FIXTURE = path.join(__dirname, 'fixtures/receipt/lean-happy');

test('formatDurationHuman — minutes', () => {
  assert.equal(formatDurationHuman(47 * 60), '47 min');
  assert.equal(formatDurationHuman(45), '45 sec');
  assert.equal(formatDurationHuman(3600), '1 hr 0 min');
  assert.equal(formatDurationHuman(3900), '1 hr 5 min');
});

test('formatCost — two decimal USD', () => {
  assert.equal(formatCost(1.844), '$1.84');
  assert.equal(formatCost(0), '$0.00');
  assert.equal(formatCost(10), '$10.00');
});

test('formatMarkdown — contains headline + work id + cost + PR url', () => {
  const md = formatMarkdown(extractReceipt(FIXTURE));
  assert.match(md, /# .*add-retry-logic/);
  assert.match(md, /Add retry logic to the API client/);
  assert.match(md, /\$1\.84/);
  assert.match(md, /https:\/\/github\.com\/example\/repo\/pull\/142/);
  assert.match(md, /lean/);
  assert.match(md, /completed/);
});

test('formatMarkdown — decisions table includes per-step cost', () => {
  const md = formatMarkdown(extractReceipt(FIXTURE));
  assert.match(md, /Decisions/);
  assert.match(md, /lean-track-check/);
  assert.match(md, /\$0\.08/);
});

test('formatMarkdown — human gates section', () => {
  const md = formatMarkdown(extractReceipt(FIXTURE));
  assert.match(md, /Human gates/);
  assert.match(md, /approval-wait/);
});

test('formatJson — round-trips', () => {
  const data = extractReceipt(FIXTURE);
  const json = formatJson(data);
  const parsed = JSON.parse(json);
  assert.equal(parsed.workId, 'add-retry-logic');
  assert.equal(parsed.costUsd, 1.84);
});
