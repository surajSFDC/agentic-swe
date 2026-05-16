'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  formatBudgetBar,
  discoverWorkDir,
  renderWorkItem,
  chooseLayout,
} = require('../scripts/swe-tui-server.cjs');

describe('swe-tui formatBudgetBar', () => {
  it('renders correct fill ratio', () => {
    const bar = formatBudgetBar(6, 10, 10);
    assert.ok(bar.includes('█'), 'Expected filled blocks');
    assert.ok(bar.includes('░'), 'Expected empty blocks');
  });

  it('handles zero budget remaining gracefully', () => {
    const bar = formatBudgetBar(0, 10, 10);
    assert.ok(!bar.includes('█') || bar.includes('░'), 'Should render without crash');
  });
});

describe('swe-tui discoverWorkDir', () => {
  it('returns newest non-completed work item', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tui-test-'));
    const wlDir = path.join(tmpRoot, '.worklogs', 'test-item');
    fs.mkdirSync(wlDir, { recursive: true });
    fs.writeFileSync(path.join(wlDir, 'state.json'), JSON.stringify({
      current_state: 'implementation',
      work_id: 'test-item',
      updated_at: new Date().toISOString(),
    }));
    const found = discoverWorkDir(tmpRoot);
    assert.ok(found, 'Expected to find work dir');
    assert.ok(found.includes('test-item'), 'Expected test-item work dir');
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });
});

describe('swe-tui renderWorkItem', () => {
  it('plain-text mode contains state and work_id', () => {
    const state = {
      work_id: 'my-task',
      current_state: 'design',
      pipeline: { track: 'standard' },
      budget: { budget_remaining: 7, iteration_budget: 10, cost_used: 0.5, cost_budget_usd: 3.0 },
      history: [],
      git: { working_branch: 'work/my-task' },
    };
    const output = renderWorkItem(state, { ansi: false, width: 80 });
    assert.ok(output.includes('my-task'), 'Expected work_id in output');
    assert.ok(output.includes('design'), 'Expected current_state in output');
  });
});

describe('swe-tui chooseLayout', () => {
  it('chooses stacked for narrow terminals', () => {
    assert.equal(chooseLayout(2, 100), 'stacked');
  });

  it('chooses side-by-side for wide terminals with 2 items', () => {
    assert.equal(chooseLayout(2, 160), 'side-by-side');
  });
});
