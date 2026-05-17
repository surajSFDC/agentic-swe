'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');

test('README version badge matches package.json version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
  const badge = readme.match(/img\.shields\.io\/badge\/version-([\d.]+)-/);
  assert.ok(badge, 'README must have a version badge');
  assert.equal(badge[1], pkg.version, `version badge says ${badge[1]} but package.json is ${pkg.version} — bump README badge`);
});
