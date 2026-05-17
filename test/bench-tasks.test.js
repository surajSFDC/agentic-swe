'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { validateTask, discoverTasks } = require('../scripts/bench/run.cjs');

const TASKS_ROOT = path.resolve(__dirname, '../bench/tasks');
const EXPECTED_TASK_IDS = ['01-off-by-one', '02-add-retry', '03-rate-limiter'];

test('bench/tasks has at least the three required starter tasks', () => {
  const taskDirs = discoverTasks(TASKS_ROOT);
  const taskIds = taskDirs.map((d) => path.basename(d));
  for (const expected of EXPECTED_TASK_IDS) {
    assert.ok(taskIds.includes(expected), `Missing expected task: ${expected}`);
  }
});

for (const taskId of EXPECTED_TASK_IDS) {
  test(`bench task ${taskId} validates without errors`, () => {
    const taskDir = path.join(TASKS_ROOT, taskId);
    const result = validateTask(taskDir);
    assert.deepEqual(
      result.errors,
      [],
      `Task ${taskId} has validation errors:\n${result.errors.join('\n')}`,
    );
    assert.equal(result.ok, true, `Task ${taskId} reported ok=false`);
  });
}

test('bench runner validate CLI exits 0 for all tasks (integration)', () => {
  const { spawnSync } = require('node:child_process');
  const runnerPath = path.resolve(__dirname, '../scripts/bench/run.cjs');
  const result = spawnSync(process.execPath, [runnerPath, 'validate', '--all'], {
    encoding: 'utf8',
    cwd: path.resolve(__dirname, '..'),
  });
  assert.equal(result.status, 0, `Validate CLI exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
  assert.ok(result.stdout.includes('All passed'), 'stdout should include "All passed"');
});
