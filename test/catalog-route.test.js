'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { rankLexical } = require('../scripts/lib/catalog/lexical-rank.cjs');

describe('catalog-route lexical', () => {
  it('same query yields same ordering for equal scores', () => {
    const agents = [
      { id: 'b/x', text: 'alpha beta' },
      { id: 'a/x', text: 'alpha beta' },
    ];
    const r1 = rankLexical('alpha', agents);
    const r2 = rankLexical('alpha', agents);
    assert.deepStrictEqual(
      r1.map((x) => x.id),
      r2.map((x) => x.id)
    );
    assert.strictEqual(r1[0].score, r1[1].score);
    assert.ok(r1[0].id.localeCompare(r1[1].id) < 0, 'tie-break alphabetical');
  });

  it('ranks higher when more query tokens match', () => {
    const agents = [
      { id: 'low', text: 'foo' },
      { id: 'high', text: 'foo bar baz' },
    ];
    const r = rankLexical('foo bar', agents);
    assert.strictEqual(r[0].id, 'high');
    assert.ok(r[0].score >= r[1].score);
  });
});
