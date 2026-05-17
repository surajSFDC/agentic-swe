'use strict';

/**
 * Stub: Token-bucket rate limiter.
 *
 * TODO: Implement TokenBucket.
 *
 * Requirements:
 *   - constructor({ capacity, refillRate }) — capacity: max tokens (integer > 0),
 *     refillRate: tokens added per second (number > 0). Throw on invalid values.
 *   - tryConsume(n = 1): boolean — returns true and deducts n tokens if available,
 *     false if insufficient tokens. Tokens are refilled based on elapsed wall time.
 *   - getTokens(): number — current token count (capped at capacity).
 *
 * Security: constructor must throw RangeError if capacity <= 0 or refillRate <= 0.
 */
class TokenBucket {
  constructor({ capacity, refillRate }) {
    // TODO: validate inputs, initialize state
    throw new Error('Not implemented');
  }

  tryConsume(n = 1) {
    // TODO
    throw new Error('Not implemented');
  }

  getTokens() {
    // TODO
    throw new Error('Not implemented');
  }
}

module.exports = { TokenBucket };
