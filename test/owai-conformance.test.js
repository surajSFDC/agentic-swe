'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateL1, validateL2, validateL3 } = require('../scripts/owai-conformance.cjs');

describe('OWAI conformance', () => {
  function createWorkDir(overrides = {}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'owai-test-'));
    const state = {
      schema_version: 2,
      work_id: 'test-001',
      task: 'Test task',
      current_state: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      budget: { iteration_budget: 10, budget_remaining: 5, cost_budget_usd: 3.0, cost_used: 1.5 },
      counters: {},
      pipeline: { track: 'lean' },
      history: [{ timestamp: new Date().toISOString(), from: 'initialized', to: 'feasibility', reason: 'start' }],
      ...overrides,
    };
    fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(state));
    fs.writeFileSync(path.join(dir, 'progress.md'), '# Progress\n');
    fs.writeFileSync(path.join(dir, 'audit.log'), 'init\n');
    return dir;
  }

  it('L1 passes with valid state.json + required files', () => {
    const dir = createWorkDir();
    const result = validateL1(dir);
    assert.equal(result.ok, true, `L1 errors: ${result.errors.join(', ')}`);
  });

  it('L1 fails without state.json', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'owai-empty-'));
    const result = validateL1(dir);
    assert.equal(result.ok, false);
  });

  it('L2 fails with empty history', () => {
    const dir = createWorkDir({ history: [] });
    const result = validateL2(dir);
    assert.equal(result.ok, false);
  });

  it('L3 detects inconsistent history chain', () => {
    const dir = createWorkDir({
      history: [
        { timestamp: new Date().toISOString(), from: 'initialized', to: 'feasibility' },
        { timestamp: new Date().toISOString(), from: 'design', to: 'implementation' },
      ],
    });
    const result = validateL3(dir);
    assert.equal(result.ok, false);
  });
});
