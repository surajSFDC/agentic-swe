'use strict';

const path = require('node:path');
const { loadMergedMemoryConfig, sqlitePathForProject } = require('./config.cjs');
const { openOrCreateDatabase, closeDatabase } = require('./graph-store.cjs');
const {
  queryGraphStatsDb,
  queryTopNodesByDegreeDb,
  queryChunkCountDb,
} = require('./graph-query.cjs');

/**
 * @param {string} q
 * @returns {string[]}
 */
function extractSearchTokens(q) {
  return String(q)
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter((p) => p.length >= 2)
    .slice(0, 16);
}

/** @param {string} body @param {string[]} tokens @param {number} maxLen */
function snippetFromBody(body, tokens, maxLen) {
  const lower = body.toLowerCase();
  let idx = -1;
  for (const t of tokens) {
    const i = lower.indexOf(t.toLowerCase());
    if (i >= 0) {
      idx = i;
      break;
    }
  }
  if (idx < 0) {
    return body.length > maxLen ? `${body.slice(0, maxLen)}…` : body;
  }
  const start = Math.max(0, idx - 48);
  const slice = body.slice(start, start + maxLen);
  return `${start > 0 ? '…' : ''}${slice}${start + maxLen < body.length ? '…' : ''}`;
}

/**
 * Lexical search on `chunks` (sql.js has no FTS5 module — LIKE-based).
 * @param {*} db
 * @param {string[]} tokens
 * @param {number} limit
 * @param {string|null} workId
 */
function queryChunkHits(db, tokens, limit, workId) {
  if (!tokens.length) return [];
  const lim = Math.min(200, Math.max(1, Number(limit) || 12));
  let sql = 'SELECT chunk_id, path, start_line, end_line, body FROM chunks WHERE ';
  sql += tokens.map(() => 'lower(body) LIKE ?').join(' AND ');
  const params = tokens.map((t) => `%${t.toLowerCase()}%`);
  if (workId) {
    sql += ' AND work_id = ?';
    params.push(workId);
  }
  sql += ` LIMIT ${lim}`;

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    const o = stmt.getAsObject();
    const b = o.body;
    o.snip = snippetFromBody(String(b || ''), tokens, 220);
    delete o.body;
    rows.push(o);
  }
  stmt.free();
  return rows;
}

/** @param {string} s @param {number} max */
function limitChars(s, max) {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 20))}\n\n… (truncated)`;
}

/**
 * @param {{ projectRoot: string, pluginRoot: string, query?: string|null, workId?: string|null }} opts
 * @returns {Promise<string>}
 */
async function buildPrimeMarkdown(opts) {
  const projectRoot = path.resolve(opts.projectRoot);
  const pluginRoot = path.resolve(opts.pluginRoot);
  const merged = loadMergedMemoryConfig(pluginRoot, projectRoot);
  const sqlitePath = sqlitePathForProject(merged, projectRoot);

  const maxOut = merged.prime && merged.prime.max_chars_out ? merged.prime.max_chars_out : 12000;
  const maxHits = merged.prime && merged.prime.max_fts_hits ? merged.prime.max_fts_hits : 12;

  const { db } = await openOrCreateDatabase(sqlitePath);
  try {
    const lines = [];
    lines.push('## Memory prime (advisory)');
    lines.push('');
    lines.push(
      '**Source priority:** treat `state.json` and repository files as authoritative; this block is retrieved context only.'
    );
    lines.push('');

    const gs = queryGraphStatsDb(db);
    const chunkCount = queryChunkCountDb(db);
    lines.push('### Graph digest');
    lines.push(`- **Nodes:** ${gs.nodes}  **Edges:** ${gs.edges}  **Indexed chunks:** ${chunkCount}`);
    if (gs.kinds && gs.kinds.nodes && Object.keys(gs.kinds.nodes).length) {
      lines.push(`- **Node kinds:** ${JSON.stringify(gs.kinds.nodes)}`);
    }
    if (gs.kinds && gs.kinds.edges && Object.keys(gs.kinds.edges).length) {
      lines.push(`- **Edge kinds:** ${JSON.stringify(gs.kinds.edges)}`);
    }

    const top = queryTopNodesByDegreeDb(db, 8);
    if (top.length) {
      lines.push('- **High-degree nodes:**');
      for (const r of top) {
        lines.push(`  - \`${r.id}\` (${r.kind}, deg ${r.deg}) ${r.label ? `— ${r.label}` : ''}`);
      }
    }
    lines.push('');

    const q = opts.query != null ? opts.query : null;
    const tokens = q ? extractSearchTokens(q) : [];
    if (tokens.length) {
      lines.push('### Chunk search (lexical)');
      lines.push(`- **Query:** ${JSON.stringify(q)}`);
      if (opts.workId) {
        lines.push(`- **Work id filter:** \`${opts.workId}\``);
      }
      lines.push('');
      try {
        const hits = queryChunkHits(db, tokens, maxHits, opts.workId || null);
        if (hits.length === 0) {
          lines.push('_No matching chunks._');
        } else {
          for (const h of hits) {
            const ref = `${h.path}:${h.start_line}-${h.end_line}`;
            lines.push(`- **${ref}** — ${h.snip || ''}`);
          }
        }
      } catch (e) {
        lines.push(`_Chunk search failed: ${e && e.message ? e.message : String(e)}_`);
      }
      lines.push('');
    } else if (q) {
      lines.push('### Chunk search (lexical)');
      lines.push('_Query produced no searchable tokens (use 2+ characters per term)._');
      lines.push('');
    }

    return limitChars(lines.join('\n'), maxOut);
  } finally {
    closeDatabase(db);
  }
}

module.exports = {
  buildPrimeMarkdown,
  extractSearchTokens,
  queryChunkHits,
};
