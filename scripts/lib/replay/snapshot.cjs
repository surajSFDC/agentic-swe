'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Compute sha256 hash of a file's contents.
 */
function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Snapshot all artifact files in a work directory.
 * Returns { filename: sha256, ... }
 */
function snapshotArtifacts(workDir) {
  const hashes = {};
  const files = fs.readdirSync(workDir).filter(f => f.endsWith('.md') || f.endsWith('.json'));
  for (const file of files) {
    const fullPath = path.join(workDir, file);
    if (fs.statSync(fullPath).isFile()) {
      hashes[file] = hashFile(fullPath);
    }
  }
  return hashes;
}

/**
 * Validate that current artifact hashes match a recorded snapshot.
 * Returns { ok: boolean, drifted: [{ file, expected, actual }] }
 */
function validateSnapshot(workDir, recordedHashes) {
  const current = snapshotArtifacts(workDir);
  const drifted = [];
  for (const [file, expectedHash] of Object.entries(recordedHashes)) {
    const actualHash = current[file] || null;
    if (actualHash !== expectedHash) {
      drifted.push({ file, expected: expectedHash, actual: actualHash });
    }
  }
  return { ok: drifted.length === 0, drifted };
}

/**
 * Replay all history entries in a state.json, validating each transition's
 * artifact_hashes against the work directory's current state at that point.
 * This is a structural validation — it does not re-run the LLM.
 */
function replayHistory(workDir) {
  const stateFile = path.join(workDir, 'state.json');
  if (!fs.existsSync(stateFile)) {
    return { ok: false, error: 'state.json not found' };
  }
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const history = state.history || [];
  if (history.length === 0) {
    return { ok: true, transitions: 0, note: 'No history entries to replay' };
  }

  const results = [];
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const result = {
      index: i,
      from: entry.from,
      to: entry.to,
      timestamp: entry.timestamp,
      ok: true,
    };

    if (entry.artifact_hashes) {
      const validation = validateSnapshot(workDir, entry.artifact_hashes);
      if (!validation.ok) {
        result.ok = false;
        result.drifted = validation.drifted;
      }
    }
    results.push(result);
  }

  const allOk = results.every(r => r.ok);
  return { ok: allOk, transitions: results.length, results };
}

module.exports = { hashFile, snapshotArtifacts, validateSnapshot, replayHistory };
