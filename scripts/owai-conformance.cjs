'use strict';

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const OWAI_SCHEMA_PATH = path.join(__dirname, '..', 'schemas', 'owai', 'state.schema.json');

function validateL1(workDir) {
  const stateFile = path.join(workDir, 'state.json');
  const errors = [];

  if (!fs.existsSync(stateFile)) {
    return { level: 'L1', ok: false, errors: ['state.json not found'] };
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (e) {
    return { level: 'L1', ok: false, errors: [`state.json parse error: ${e.message}`] };
  }

  const ajv = new Ajv({ allErrors: true });
  const schema = JSON.parse(fs.readFileSync(OWAI_SCHEMA_PATH, 'utf8'));
  const validate = ajv.compile(schema);
  if (!validate(state)) {
    for (const err of validate.errors) {
      errors.push(`${err.instancePath || '/'} ${err.message}`);
    }
  }

  const requiredFiles = ['progress.md', 'audit.log'];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(workDir, f))) {
      errors.push(`Missing required file: ${f}`);
    }
  }

  return { level: 'L1', ok: errors.length === 0, errors, state };
}

function validateL2(workDir) {
  const l1 = validateL1(workDir);
  if (!l1.ok) return { ...l1, level: 'L2' };

  const errors = [...l1.errors];
  const state = l1.state;

  if (state.artifacts) {
    for (const [name, value] of Object.entries(state.artifacts)) {
      if (value) {
        const artPath = path.join(workDir, value);
        if (!fs.existsSync(artPath)) {
          errors.push(`Artifact declared but missing: ${name} -> ${value}`);
        }
      }
    }
  }

  if (!state.history || state.history.length === 0) {
    errors.push('History is empty — L2 requires at least one transition');
  }

  return { level: 'L2', ok: errors.length === 0, errors };
}

function validateL3(workDir) {
  const l2 = validateL2(workDir);
  if (!l2.ok) return { ...l2, level: 'L3' };

  const errors = [...l2.errors];
  const state = JSON.parse(fs.readFileSync(path.join(workDir, 'state.json'), 'utf8'));

  if (state.budget) {
    if (state.budget.budget_remaining < 0) {
      errors.push('Budget remaining is negative');
    }
    if (state.budget.cost_used > state.budget.cost_budget_usd * 2) {
      errors.push('Cost used exceeds 2x budget — likely a tracking error');
    }
  }

  const history = state.history || [];
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (!entry.from || !entry.to) {
      errors.push(`History entry ${i}: missing from/to`);
    }
    if (i > 0 && history[i - 1].to !== entry.from) {
      errors.push(`History entry ${i}: from="${entry.from}" doesn't match previous to="${history[i - 1].to}"`);
    }
  }

  return { level: 'L3', ok: errors.length === 0, errors };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const workDir = args.find(a => !a.startsWith('--'));
  const levelArg = args.find(a => a.startsWith('--level'));
  let level = 'L1';
  if (levelArg) {
    if (levelArg.includes('=')) {
      level = levelArg.split('=')[1];
    } else {
      const idx = args.indexOf(levelArg);
      level = args[idx + 1] || 'L1';
    }
  }

  if (!workDir) {
    console.error('Usage: node owai-conformance.cjs <work-dir> [--level L1|L2|L3]');
    process.exit(1);
  }

  const validators = { L1: validateL1, L2: validateL2, L3: validateL3 };
  const validate = validators[level.toUpperCase()] || validateL1;
  const result = validate(workDir);

  if (result.ok) {
    console.log(`OWAI ${result.level} conformance: PASS`);
  } else {
    console.error(`OWAI ${result.level} conformance: FAIL`);
    for (const e of result.errors) {
      console.error(`  - ${e}`);
    }
  }
  process.exit(result.ok ? 0 : 1);
}

module.exports = { validateL1, validateL2, validateL3 };
