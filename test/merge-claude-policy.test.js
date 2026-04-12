'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { mergeClaudePolicy, BEGIN_LINE, BEGIN_NEEDLE } = require('../scripts/merge-claude-policy.js');

const repoRoot = path.join(__dirname, '..');

function mkdtemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'merge-claude-'));
}

describe('merge-claude-policy', () => {
  it('creates CLAUDE.md when missing', () => {
    const dir = mkdtemp();
    const r = mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir });
    assert.strictEqual(r.action, 'created');
    const out = path.join(dir, 'CLAUDE.md');
    assert.ok(fs.existsSync(out));
    assert.ok(fs.readFileSync(out, 'utf8').includes('Hypervisor'));
    assert.ok(!fs.readFileSync(out, 'utf8').includes(BEGIN_NEEDLE));
  });

  it('second merge is unchanged when file is already full pack copy', () => {
    const dir = mkdtemp();
    mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir });
    const r2 = mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir });
    assert.strictEqual(r2.action, 'unchanged');
  });

  it('appends policy block when CLAUDE.md exists without delimiter', () => {
    const dir = mkdtemp();
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# My project\n\nLocal rules.\n', 'utf8');
    const r = mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir });
    assert.strictEqual(r.action, 'appended');
    const body = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(body.startsWith('# My project'));
    assert.ok(body.includes(BEGIN_LINE));
    assert.ok(body.includes('Hypervisor'));
  });

  it('replaces content after delimiter on upgrade', () => {
    const dir = mkdtemp();
    const stale = 'STALE_POLICY_MARKER_SHOULD_VANISH';
    fs.writeFileSync(
      path.join(dir, 'CLAUDE.md'),
      `# Top\n\n${BEGIN_LINE}\n\n${stale}\n`,
      'utf8',
    );
    const r = mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir });
    assert.strictEqual(r.action, 'upgraded');
    const body = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(body.includes('# Top'));
    assert.ok(!body.includes(stale));
    assert.ok(body.includes('Hypervisor'));
  });

  it('--gitignore appends .worklogs/ when missing', () => {
    const dir = mkdtemp();
    const r = mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir, gitignore: true });
    assert.strictEqual(r.gitignore, 'appended');
    const gi = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
    assert.ok(gi.includes('.worklogs/'));
  });

  it('--gitignore leaves .gitignore unchanged when .worklogs/ present', () => {
    const dir = mkdtemp();
    fs.writeFileSync(path.join(dir, '.gitignore'), 'node_modules/\n.worklogs/\n', 'utf8');
    const r = mergeClaudePolicy({ packRoot: repoRoot, targetDir: dir, gitignore: true });
    assert.strictEqual(r.gitignore, 'unchanged');
  });

  it('throws when pack has no CLAUDE.md', () => {
    const dir = mkdtemp();
    assert.throws(() => mergeClaudePolicy({ packRoot: dir, targetDir: dir }), /pack CLAUDE\.md not found/);
  });
});
