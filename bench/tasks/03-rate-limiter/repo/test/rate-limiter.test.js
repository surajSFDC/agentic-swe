'use strict';

const assert = require('node:assert/strict');
const { TokenBucket } = require('../src/rate-limiter.js');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`        ${err.message}`);
      failed++;
    }
  }

  // --- Construction and validation ---

  await test('constructs with valid config', () => {
    const b = new TokenBucket({ capacity: 10, refillRate: 1 });
    assert.equal(b.getTokens(), 10, 'starts at full capacity');
  });

  await test('throws on capacity <= 0', () => {
    assert.throws(
      () => new TokenBucket({ capacity: 0, refillRate: 1 }),
      { name: 'RangeError' },
    );
    assert.throws(
      () => new TokenBucket({ capacity: -5, refillRate: 1 }),
      { name: 'RangeError' },
    );
  });

  await test('throws on refillRate <= 0', () => {
    assert.throws(
      () => new TokenBucket({ capacity: 10, refillRate: 0 }),
      { name: 'RangeError' },
    );
    assert.throws(
      () => new TokenBucket({ capacity: 10, refillRate: -1 }),
      { name: 'RangeError' },
    );
  });

  // --- tryConsume ---

  await test('tryConsume(1) succeeds when tokens available', () => {
    const b = new TokenBucket({ capacity: 5, refillRate: 1 });
    assert.equal(b.tryConsume(1), true);
    assert.equal(b.getTokens(), 4);
  });

  await test('tryConsume drains to zero', () => {
    const b = new TokenBucket({ capacity: 3, refillRate: 1 });
    assert.equal(b.tryConsume(3), true);
    assert.equal(b.getTokens(), 0);
  });

  await test('tryConsume returns false when insufficient tokens', () => {
    const b = new TokenBucket({ capacity: 2, refillRate: 1 });
    b.tryConsume(2); // drain
    assert.equal(b.tryConsume(1), false, 'should fail when empty');
    assert.equal(b.getTokens(), 0, 'tokens must not go negative');
  });

  await test('tryConsume(n > capacity) always returns false', () => {
    const b = new TokenBucket({ capacity: 5, refillRate: 1 });
    assert.equal(b.tryConsume(6), false, 'cannot consume more than capacity');
  });

  // --- Refill (time-based) ---

  await test('tokens refill over time', async () => {
    // capacity=2, refillRate=100 tokens/sec => ~10ms per token
    const b = new TokenBucket({ capacity: 2, refillRate: 100 });
    b.tryConsume(2); // drain
    assert.equal(b.getTokens(), 0);

    // Wait 25ms — should refill ~2.5 tokens, capped at capacity=2
    await new Promise((r) => setTimeout(r, 25));
    const tokens = b.getTokens();
    assert.ok(tokens >= 1, `should have refilled at least 1 token, got ${tokens}`);
    assert.ok(tokens <= 2, `should not exceed capacity of 2, got ${tokens}`);
  });

  await test('tokens do not exceed capacity after long wait', async () => {
    const b = new TokenBucket({ capacity: 3, refillRate: 1000 });
    b.tryConsume(3);
    await new Promise((r) => setTimeout(r, 50)); // well past full refill
    assert.ok(b.getTokens() <= 3, 'must not exceed capacity');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => { console.error(err); process.exit(1); });
