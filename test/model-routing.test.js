'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { loadModelRouting, tierForPhase, tierForTaskClass } = require('../scripts/lib/catalog/model-routing.cjs');

const pluginRoot = path.join(__dirname, '..');

describe('model-routing', () => {
  it('loads default and resolves phase tiers', () => {
    const r = loadModelRouting(pluginRoot, null);
    assert.strictEqual(r.schema_version, 1);
    assert.strictEqual(tierForPhase(r, 'design'), 'balanced');
    assert.strictEqual(tierForPhase(r, 'feasibility'), 'fast');
    assert.strictEqual(tierForPhase(r, 'code-review'), 'heavy');
  });

  it('maps task classes', () => {
    const r = loadModelRouting(pluginRoot, null);
    assert.strictEqual(tierForTaskClass(r, 'lint'), 'fast');
    assert.strictEqual(tierForTaskClass(r, 'security_review'), 'heavy');
  });
});
