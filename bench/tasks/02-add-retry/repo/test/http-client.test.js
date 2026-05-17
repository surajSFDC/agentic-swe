'use strict';

const assert = require('node:assert/strict');
const { fetchWithRetry } = require('../src/http-client.js');

// --- Helpers ---------------------------------------------------------------

function makeFetch(responses) {
  // responses: array of { status, body } — returned in order, last repeated
  let i = 0;
  return async function _mockFetch(_url) {
    const r = responses[Math.min(i++, responses.length - 1)];
    return { status: r.status, body: r.body };
  };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Tests -----------------------------------------------------------------

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

  // 1. 200 on first attempt — no retry needed
  await test('returns 200 immediately, no retry', async () => {
    let callCount = 0;
    const result = await fetchWithRetry('http://example.com', {
      maxAttempts: 3,
      baseDelayMs: 0,
      _fetch: async () => { callCount++; return { status: 200, body: 'ok' }; },
    });
    assert.equal(result.status, 200);
    assert.equal(callCount, 1, 'should only call fetch once for a 200');
  });

  // 2. 503 then 200 — should retry and succeed
  await test('retries on 503, succeeds on second attempt', async () => {
    const result = await fetchWithRetry('http://example.com', {
      maxAttempts: 3,
      baseDelayMs: 0,
      _fetch: makeFetch([{ status: 503, body: 'err' }, { status: 200, body: 'ok' }]),
    });
    assert.equal(result.status, 200);
  });

  // 3. 404 — must NOT retry
  await test('does not retry on 404', async () => {
    let callCount = 0;
    const result = await fetchWithRetry('http://example.com', {
      maxAttempts: 3,
      baseDelayMs: 0,
      _fetch: async () => { callCount++; return { status: 404, body: 'not found' }; },
    });
    assert.equal(result.status, 404);
    assert.equal(callCount, 1, 'must not retry 4xx');
  });

  // 4. Persistent 500 — exhausts maxAttempts and rejects
  await test('exhausts maxAttempts on persistent 500 and rejects', async () => {
    let callCount = 0;
    await assert.rejects(
      () => fetchWithRetry('http://example.com', {
        maxAttempts: 2,
        baseDelayMs: 0,
        _fetch: async () => { callCount++; return { status: 500, body: 'server error' }; },
      }),
      /attempt|retry|exhausted/i,
      'should reject after exhausting attempts'
    );
    assert.equal(callCount, 2, 'should attempt exactly maxAttempts times');
  });

  // 5. maxAttempts=1 — no retry at all, even for 5xx
  await test('maxAttempts=1 means no retry on 500', async () => {
    let callCount = 0;
    await assert.rejects(
      () => fetchWithRetry('http://example.com', {
        maxAttempts: 1,
        baseDelayMs: 0,
        _fetch: async () => { callCount++; return { status: 500, body: 'err' }; },
      }),
      Error,
    );
    assert.equal(callCount, 1);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => { console.error(err); process.exit(1); });
