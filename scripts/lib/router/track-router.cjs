'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Tokenize text into lowercased words, stripping markdown and punctuation.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[#*`\[\](){}|>_~]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

/**
 * Build TF-IDF vectors from completed worklogs.
 * Each worklog is represented by its feasibility.md content.
 */
function buildCorpus(worklogsDir) {
  if (!fs.existsSync(worklogsDir)) return [];

  const corpus = [];
  const dirs = fs.readdirSync(worklogsDir);
  for (const dir of dirs) {
    const stateFile = path.join(worklogsDir, dir, 'state.json');
    const feasFile = path.join(worklogsDir, dir, 'feasibility.md');
    if (!fs.existsSync(stateFile) || !fs.existsSync(feasFile)) continue;

    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      if (state.current_state !== 'completed') continue;
      const track = state.pipeline?.track;
      const costUsed = state.budget?.cost_used || 0;
      const text = fs.readFileSync(feasFile, 'utf8');
      const tokens = tokenize(text);
      corpus.push({ workId: dir, track, costUsed, tokens, text });
    } catch { /* skip malformed entries */ }
  }
  return corpus;
}

/**
 * Compute term frequency for a token array.
 */
function termFrequency(tokens) {
  const tf = {};
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  const max = Math.max(...Object.values(tf), 1);
  for (const t of Object.keys(tf)) {
    tf[t] = tf[t] / max;
  }
  return tf;
}

/**
 * Compute cosine similarity between two TF vectors.
 */
function cosineSimilarity(a, b) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const k of allKeys) {
    const va = a[k] || 0;
    const vb = b[k] || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Recommend a track for a new task based on similar completed worklogs.
 * Returns { track, confidence, evidence_ids[], avgCost }
 */
function recommend(worklogsDir, newFeasibilityText, topK = 3) {
  const corpus = buildCorpus(worklogsDir);
  if (corpus.length === 0) {
    return { track: null, confidence: 'none', evidence_ids: [], avgCost: null, reason: 'No completed worklogs for comparison' };
  }

  const queryTokens = tokenize(newFeasibilityText);
  const queryTf = termFrequency(queryTokens);

  const scored = corpus.map(entry => ({
    ...entry,
    similarity: cosineSimilarity(queryTf, termFrequency(entry.tokens)),
  })).sort((a, b) => b.similarity - a.similarity);

  const topMatches = scored.slice(0, topK).filter(m => m.similarity > 0.1);
  if (topMatches.length === 0) {
    return { track: null, confidence: 'low', evidence_ids: [], avgCost: null, reason: 'No sufficiently similar worklogs found' };
  }

  const trackVotes = {};
  let totalCost = 0;
  for (const match of topMatches) {
    trackVotes[match.track] = (trackVotes[match.track] || 0) + match.similarity;
    totalCost += match.costUsed;
  }

  const recommendedTrack = Object.entries(trackVotes)
    .sort(([, a], [, b]) => b - a)[0][0];

  const avgCost = totalCost / topMatches.length;
  const maxSim = topMatches[0].similarity;
  const confidence = maxSim > 0.5 ? 'high' : maxSim > 0.3 ? 'medium' : 'low';

  return {
    track: recommendedTrack,
    confidence,
    evidence_ids: topMatches.map(m => m.workId),
    avgCost: Math.round(avgCost * 100) / 100,
    reason: `Based on ${topMatches.length} similar completed worklogs (best similarity: ${maxSim.toFixed(2)})`,
  };
}

module.exports = { tokenize, buildCorpus, recommend, termFrequency, cosineSimilarity };
