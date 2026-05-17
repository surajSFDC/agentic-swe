/**
 * Bench task 01 — intentional off-by-one bug.
 * The agent must fix countItems to return arr.length (not arr.length - 1).
 * @param {unknown[]} arr
 * @returns {number}
 */
export function countItems(arr) {
  // Bug: off-by-one
  return arr.length - 1;
}

export const MODULE_VERSION = '1.0.0';
