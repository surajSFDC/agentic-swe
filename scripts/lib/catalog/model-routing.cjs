'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * @param {string} pluginRoot pack root (directory containing config/)
 * @param {string} [projectRoot] cwd project; merged file at .agentic-swe/model-routing.json
 * @returns {object}
 */
function loadModelRouting(pluginRoot, projectRoot) {
  const defPath = path.join(pluginRoot, 'config', 'model-routing.default.json');
  const base = JSON.parse(fs.readFileSync(defPath, 'utf8'));
  let merged = base;
  if (projectRoot) {
    const override = path.join(projectRoot, '.agentic-swe', 'model-routing.json');
    if (fs.existsSync(override)) {
      const o = JSON.parse(fs.readFileSync(override, 'utf8'));
      merged = deepMerge(base, o);
    }
  }
  return merged;
}

function deepMerge(a, b) {
  if (b == null) return a;
  const out = { ...a };
  for (const k of Object.keys(b)) {
    if (b[k] != null && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof a[k] === 'object' && a[k] != null) {
      out[k] = deepMerge(a[k], b[k]);
    } else {
      out[k] = b[k];
    }
  }
  return out;
}

/**
 * @param {object} routing merged config
 * @param {string} phase
 * @returns {string|undefined} tier
 */
function tierForPhase(routing, phase) {
  const m = routing.phase_tiers || {};
  return m[phase];
}

/**
 * @param {object} routing merged config
 * @param {string} taskClass
 * @returns {string|undefined}
 */
function tierForTaskClass(routing, taskClass) {
  const m = routing.task_class_tiers || {};
  return m[taskClass];
}

module.exports = {
  loadModelRouting,
  tierForPhase,
  tierForTaskClass,
  deepMerge,
};
