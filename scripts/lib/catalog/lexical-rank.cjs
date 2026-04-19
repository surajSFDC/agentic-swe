'use strict';

const { extractFrontmatter, parseSimpleFields } = require('./parse-frontmatter.cjs');

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'to',
  'of',
  'in',
  'on',
  'with',
  'when',
  'use',
  'this',
  'that',
  'you',
  'is',
  'are',
  'be',
  'as',
  'at',
  'by',
  'it',
]);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

/**
 * @param {string} query
 * @param {Array<{ id: string, text: string }>} agents
 * @returns {Array<{ id: string, score: number }>}
 */
function rankLexical(query, agents) {
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) {
    return agents.map((a) => ({ id: a.id, score: 0 })).sort((x, y) => x.id.localeCompare(y.id));
  }
  const scored = agents.map((a) => {
    const docTokens = tokenize(a.text);
    let score = 0;
    const seen = new Set();
    for (const t of docTokens) {
      if (qTokens.has(t) && !seen.has(t)) {
        seen.add(t);
        score += 1;
      }
    }
    return { id: a.id, score };
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });
  return scored;
}

/**
 * Build searchable text from agent markdown file content.
 * @param {string} content
 * @param {string} id category/name
 */
function agentSearchBlob(content, id) {
  const ex = extractFrontmatter(content);
  if (!ex) return { id, text: id.replace(/\//g, ' ') };
  const fm = parseSimpleFields(ex.block);
  const name = fm.name || '';
  const desc = fm.description || '';
  return { id, text: `${name} ${desc} ${ex.body.slice(0, 4000)}` };
}

module.exports = {
  rankLexical,
  tokenize,
  agentSearchBlob,
};
