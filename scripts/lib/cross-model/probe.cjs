'use strict';

const { execSync } = require('child_process');

/**
 * Probe whether an external model CLI is available and functional.
 * Returns { available: boolean, path?: string, version?: string, error?: string }
 */
function probeCli(name) {
  const result = { available: false };
  try {
    const whichOut = execSync(`which ${name} 2>/dev/null`, { encoding: 'utf8', timeout: 5000 }).trim();
    if (!whichOut) {
      result.error = `${name} not found in PATH`;
      return result;
    }
    result.path = whichOut;
  } catch {
    result.error = `${name} not found in PATH`;
    return result;
  }

  try {
    const versionOut = execSync(`${name} --version 2>&1`, { encoding: 'utf8', timeout: 10000 }).trim();
    result.version = versionOut.split('\n')[0];
    result.available = true;
  } catch (err) {
    result.error = `${name} found at ${result.path} but --version failed: ${err.message}`;
  }

  return result;
}

/**
 * Probe all supported cross-model CLIs and return availability map.
 */
function probeAll() {
  const clis = ['codex', 'gemini'];
  const results = {};
  for (const cli of clis) {
    results[cli] = probeCli(cli);
  }
  return results;
}

module.exports = { probeCli, probeAll };
