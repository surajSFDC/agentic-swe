'use strict';

const fs = require('node:fs');
const { embedText, cosineSimilarity } = require('../memory/embeddings-backend.cjs');

/**
 * @param {string} query
 * @param {string} indexPath absolute path to catalog-embeddings.json
 * @param {object} rt embedding runtime from resolveEmbeddingRuntime
 */
async function rankByEmbedding(query, indexPath, rt) {
  const raw = fs.readFileSync(indexPath, 'utf8');
  const data = JSON.parse(raw);
  if (!data.agents || !Array.isArray(data.agents)) {
    throw new Error('invalid catalog embedding index: missing agents[]');
  }
  const qText = String(query).slice(0, 8000);
  const q = await embedText(qText, rt);
  const out = [];
  for (const a of data.agents) {
    if (!a.vec || !a.id) continue;
    const vec = Float32Array.from(a.vec);
    if (vec.length !== q.vec.length) {
      throw new Error(`dimension mismatch for ${a.id}: index ${vec.length} vs query ${q.vec.length}`);
    }
    const sim = cosineSimilarity(q.vec, vec);
    out.push({ id: a.id, score: sim });
  }
  out.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });
  return out;
}

module.exports = {
  rankByEmbedding,
};
