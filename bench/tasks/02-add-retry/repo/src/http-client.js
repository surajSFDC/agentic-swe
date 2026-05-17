'use strict';

/**
 * Stub HTTP client.
 *
 * TODO: Implement retry logic.
 *
 * Requirements:
 *   - Retry on HTTP 5xx responses, up to maxAttempts total attempts.
 *   - Do NOT retry on 4xx responses (fail fast).
 *   - Use exponential backoff: delay doubles each retry, starting at baseDelayMs.
 *   - Resolve with the final Response-like object ({ status, body }).
 *   - Reject with an Error if all attempts are exhausted.
 *
 * @param {string} url
 * @param {{ maxAttempts?: number, baseDelayMs?: number, _fetch?: Function }} [options]
 * @returns {Promise<{ status: number, body: string }>}
 */
async function fetchWithRetry(url, options = {}) {
  const { maxAttempts = 3, baseDelayMs = 100, _fetch } = options;
  const fetcher = _fetch || fetch;
  // Stub: no retry logic yet
  const response = await fetcher(url);
  return response;
}

module.exports = { fetchWithRetry };
