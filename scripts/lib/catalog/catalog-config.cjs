'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { deepMerge } = require('../work-engine/budget-config.cjs');

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * @param {string} pluginRoot
 * @param {string} [projectRoot]
 */
function loadMergedCatalogConfig(pluginRoot, projectRoot) {
  const defPath = path.join(pluginRoot, 'config', 'catalog.default.json');
  let merged = readJson(defPath);
  if (!merged || typeof merged !== 'object') {
    merged = { schema_version: 1, embeddings: { enabled: false, provider: 'none' }, index: {} };
  }
  const envPath = process.env.AGENTIC_SWE_CATALOG_CONFIG;
  if (envPath) {
    const o = readJson(envPath);
    if (o) merged = deepMerge(merged, o);
  }
  if (projectRoot) {
    const local = readJson(path.join(projectRoot, '.agentic-swe', 'catalog.json'));
    if (local) merged = deepMerge(merged, local);
  }
  return merged;
}

/**
 * @param {object} merged
 * @param {string} projectRoot
 * @returns {string} absolute path to embedding index JSON
 */
function resolveCatalogIndexPath(merged, projectRoot) {
  const idx = merged.index || {};
  const dir = idx.directory_relative != null ? idx.directory_relative : '.agentic-swe';
  const name = idx.relative_path != null ? idx.relative_path : 'catalog-embeddings.json';
  return path.join(projectRoot, dir, name);
}

module.exports = {
  loadMergedCatalogConfig,
  resolveCatalogIndexPath,
};
