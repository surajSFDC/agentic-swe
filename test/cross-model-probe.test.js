'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { probeCli, probeAll } = require('../scripts/lib/cross-model/probe.cjs');

describe('Cross-model probe', () => {
  it('probeAll returns an object with codex and gemini keys', () => {
    const results = probeAll();
    assert.ok('codex' in results, 'Missing codex key');
    assert.ok('gemini' in results, 'Missing gemini key');
  });

  it('probeCli returns a structured result for any CLI name', () => {
    const result = probeCli('nonexistent-cli-12345');
    assert.equal(result.available, false);
    assert.ok(result.error, 'Expected an error message for missing CLI');
  });

  it('each probe result has the expected shape', () => {
    const results = probeAll();
    for (const [name, result] of Object.entries(results)) {
      assert.equal(typeof result.available, 'boolean', `${name}.available should be boolean`);
      if (result.available) {
        assert.ok(result.path, `${name}.path should exist when available`);
        assert.ok(result.version, `${name}.version should exist when available`);
      } else {
        assert.ok(result.error, `${name}.error should exist when unavailable`);
      }
    }
  });
});
