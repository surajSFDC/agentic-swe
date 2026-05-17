const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'scripts', 'render-receipt.cjs');
const FIXTURE = path.join(__dirname, 'fixtures', 'receipt', 'lean-happy');

test('CLI — explicit --work-dir prints markdown to stdout', () => {
  const out = execFileSync('node', [CLI, '--work-dir', FIXTURE], { encoding: 'utf8' });
  assert.match(out, /# \/work/);
  assert.match(out, /add-retry-logic/);
});

test('CLI — --format=json prints JSON', () => {
  const out = execFileSync('node', [CLI, '--work-dir', FIXTURE, '--format=json'], { encoding: 'utf8' });
  const parsed = JSON.parse(out);
  assert.equal(parsed.workId, 'add-retry-logic');
});

test('CLI — missing work dir exits non-zero with helpful error', () => {
  assert.throws(
    () => execFileSync('node', [CLI, '--work-dir', '/tmp/does-not-exist-9999'], { encoding: 'utf8', stdio: ['ignore', 'ignore', 'pipe'] }),
    /state\.json/,
  );
});
