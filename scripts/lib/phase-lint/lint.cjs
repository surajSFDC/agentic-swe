'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_SCHEMA = {
  required_headings: ['Mission', 'Common Rationalizations', 'Red Flags'],
  recommended_headings: ['Procedure', 'Inputs', 'Required Output', 'Failure Protocol'],
  exempt_files: ['subagent-selection.md'],
};

/**
 * Extract H2 headings from markdown content.
 */
function extractH2Headings(content) {
  const pattern = /^## (.+)$/gm;
  const headings = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    headings.push(match[1].trim());
  }
  return headings;
}

/**
 * Lint a single phase file against the schema.
 * Returns { file, errors: [], warnings: [] }
 */
function lintPhase(filePath, schema = DEFAULT_SCHEMA) {
  const fileName = path.basename(filePath);
  const result = { file: fileName, errors: [], warnings: [] };

  if (schema.exempt_files.includes(fileName)) {
    return result;
  }

  if (!fs.existsSync(filePath)) {
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const headings = extractH2Headings(content);

  for (const req of schema.required_headings) {
    if (!headings.includes(req)) {
      result.errors.push(`Missing required section: ## ${req}`);
    }
  }

  for (const rec of schema.recommended_headings) {
    if (!headings.includes(rec)) {
      result.warnings.push(`Missing recommended section: ## ${rec}`);
    }
  }

  if (content.trim().length < 100) {
    result.errors.push('Phase file is suspiciously short (<100 chars)');
  }

  return result;
}

/**
 * Lint all phase files in a directory.
 * Returns { ok: boolean, results: [] }
 */
function lintAll(phasesDir, schemaPath) {
  let schema = DEFAULT_SCHEMA;
  if (schemaPath && fs.existsSync(schemaPath)) {
    schema = { ...DEFAULT_SCHEMA, ...JSON.parse(fs.readFileSync(schemaPath, 'utf8')) };
  }

  const files = fs.readdirSync(phasesDir).filter(f => f.endsWith('.md'));
  const results = files.map(f => lintPhase(path.join(phasesDir, f), schema));
  const ok = results.every(r => r.errors.length === 0);
  return { ok, results };
}

if (require.main === module) {
  const phasesDir = process.argv[2] || path.join(__dirname, '..', '..', '..', 'phases');
  const schemaPath = process.argv[3] || path.join(__dirname, '..', '..', '..', 'schemas', 'phase-prompt.schema.json');
  const { ok, results } = lintAll(phasesDir, schemaPath);

  let hasErrors = false;
  for (const r of results) {
    if (r.errors.length > 0) {
      hasErrors = true;
      console.error(`FAIL ${r.file}:`);
      for (const e of r.errors) console.error(`  ERROR: ${e}`);
    }
    if (r.warnings.length > 0) {
      console.warn(`WARN ${r.file}:`);
      for (const w of r.warnings) console.warn(`  WARN: ${w}`);
    }
  }

  if (!hasErrors) {
    console.log(`All ${results.length} phase files pass lint.`);
  }
  process.exit(ok ? 0 : 1);
}

module.exports = { extractH2Headings, lintPhase, lintAll };
