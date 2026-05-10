'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { snapshotArtifacts, validateSnapshot, replayHistory, hashFile } = require('../scripts/lib/replay/snapshot.cjs');

describe('Replay snapshot', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'replay-test-'));

  it('hashFile returns consistent sha256', () => {
    const testFile = path.join(tmpDir, 'test.md');
    fs.writeFileSync(testFile, 'hello world');
    const h1 = hashFile(testFile);
    const h2 = hashFile(testFile);
    assert.equal(h1, h2);
    assert.equal(h1.length, 64);
  });

  it('hashFile returns null for missing file', () => {
    assert.equal(hashFile(path.join(tmpDir, 'missing.md')), null);
  });

  it('snapshotArtifacts captures md and json files', () => {
    fs.writeFileSync(path.join(tmpDir, 'feasibility.md'), 'content');
    fs.writeFileSync(path.join(tmpDir, 'state.json'), '{}');
    const snap = snapshotArtifacts(tmpDir);
    assert.ok('feasibility.md' in snap);
    assert.ok('state.json' in snap);
  });

  it('validateSnapshot detects drift', () => {
    const snap = snapshotArtifacts(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'feasibility.md'), 'changed content');
    const result = validateSnapshot(tmpDir, snap);
    assert.equal(result.ok, false);
    assert.ok(result.drifted.length > 0);
  });

  it('replayHistory returns ok for empty history', () => {
    const stateFile = path.join(tmpDir, 'state.json');
    fs.writeFileSync(stateFile, JSON.stringify({ history: [] }));
    const result = replayHistory(tmpDir);
    assert.equal(result.ok, true);
  });
});
