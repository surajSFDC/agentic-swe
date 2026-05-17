import assert from 'node:assert/strict';
import { countItems, MODULE_VERSION } from '../src/counter.js';

// Metadata
assert.equal(typeof MODULE_VERSION, 'string', 'MODULE_VERSION must be a string');

// Core contract
assert.equal(countItems([]), 0, 'empty array must return 0');
assert.equal(countItems([1]), 1, 'single-element array must return 1');
assert.equal(countItems([1, 2, 3]), 3, 'three-element array must return 3');
assert.equal(countItems(['a', 'b', 'c', 'd']), 4, 'four-element array must return 4');

console.log('All tests passed.');
