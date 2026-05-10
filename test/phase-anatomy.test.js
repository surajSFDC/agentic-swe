'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const PHASES_DIR = path.join(__dirname, '..', 'phases');
const UTILITY_PHASES = ['subagent-selection.md'];

const REQUIRED_SECTIONS = [
  '## Common Rationalizations',
  '## Red Flags',
];

describe('Phase anatomy lint', () => {
  const phaseFiles = fs.readdirSync(PHASES_DIR)
    .filter(f => f.endsWith('.md') && !UTILITY_PHASES.includes(f));

  for (const file of phaseFiles) {
    it(`${file} has required sections`, () => {
      const content = fs.readFileSync(path.join(PHASES_DIR, file), 'utf8');
      for (const section of REQUIRED_SECTIONS) {
        assert.ok(
          content.includes(section),
          `${file} is missing required section: ${section}`
        );
      }
    });

    it(`${file} has a Rationalization table with at least one row`, () => {
      const content = fs.readFileSync(path.join(PHASES_DIR, file), 'utf8');
      const rationalIdx = content.indexOf('## Common Rationalizations');
      if (rationalIdx === -1) return;
      const afterSection = content.slice(rationalIdx);
      const tableRowPattern = /\|\s*"[^"]+"\s*\|/;
      assert.ok(
        tableRowPattern.test(afterSection),
        `${file} has Rationalizations section but no table rows with quoted excuses`
      );
    });

    it(`${file} has at least one Red Flag bullet`, () => {
      const content = fs.readFileSync(path.join(PHASES_DIR, file), 'utf8');
      const flagIdx = content.indexOf('## Red Flags');
      if (flagIdx === -1) return;
      const afterSection = content.slice(flagIdx, content.indexOf('\n## ', flagIdx + 1) || undefined);
      const bulletPattern = /^- .+/m;
      assert.ok(
        bulletPattern.test(afterSection),
        `${file} has Red Flags section but no bullet points`
      );
    });
  }
});
