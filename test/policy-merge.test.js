'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { mergePolicies } = require('../scripts/lib/policy/merge.cjs');

describe('Policy merge', () => {
  it('returns pack default when no overrides', () => {
    const result = mergePolicies({ version: '1.0' }, null, null);
    assert.equal(result.version, '1.0');
  });

  it('repo policy overrides pack default', () => {
    const packDefault = { version: '1.0', track_rules: [{ pattern: '*.js', minimum_track: 'lean' }] };
    const repoPolicy = { track_rules: [{ pattern: 'src/auth/**', minimum_track: 'rigorous' }] };
    const result = mergePolicies(packDefault, repoPolicy, null);
    assert.equal(result.track_rules.length, 2);
  });

  it('org policy has highest precedence', () => {
    const packDefault = { budget_overrides: { max_cost_usd: 3.0 } };
    const repoPolicy = { budget_overrides: { max_cost_usd: 5.0 } };
    const orgPolicy = { budget_overrides: { max_cost_usd: 10.0 } };
    const result = mergePolicies(packDefault, repoPolicy, orgPolicy);
    assert.equal(result.budget_overrides.max_cost_usd, 10.0);
  });

  it('mandatory_subagents are concatenated', () => {
    const packDefault = { mandatory_subagents: [{ pattern: '*.sql', subagent: 'a.md' }] };
    const repoPolicy = { mandatory_subagents: [{ pattern: 'src/**', subagent: 'b.md' }] };
    const result = mergePolicies(packDefault, repoPolicy, null);
    assert.equal(result.mandatory_subagents.length, 2);
  });
});
