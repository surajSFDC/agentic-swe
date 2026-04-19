'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_VERSION = '1';

const DDL = `
CREATE TABLE IF NOT EXISTS memory_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  path TEXT,
  label TEXT,
  meta_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_nodes_kind ON nodes(kind);
CREATE TABLE IF NOT EXISTS edges (
  src_id TEXT NOT NULL,
  dst_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  meta_json TEXT,
  PRIMARY KEY (src_id, dst_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_edges_src ON edges(src_id);
CREATE INDEX IF NOT EXISTS idx_edges_dst ON edges(dst_id);
`;

/** @param {*} db sql.js Database */
function initSchema(db) {
  db.run(DDL);
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO memory_meta (key, value) VALUES (?, ?)'
  );
  stmt.run(['graph_schema_version', SCHEMA_VERSION]);
  stmt.free();
}

/** @param {*} db */
function clearGraphTables(db) {
  db.run('DELETE FROM edges;');
  db.run('DELETE FROM nodes;');
}

/** @returns {Promise<*>} */
async function loadSqlJs() {
  const initSqlJs = require('sql.js');
  return initSqlJs();
}

/**
 * @param {string} sqlitePath absolute path
 * @returns {Promise<{ db: *, SQL: * }>}
 */
async function openOrCreateDatabase(sqlitePath) {
  const SQL = await loadSqlJs();
  const dir = path.dirname(sqlitePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let db;
  if (fs.existsSync(sqlitePath)) {
    const buf = fs.readFileSync(sqlitePath);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  initSchema(db);
  return { db, SQL };
}

/** @param {*} db @param {string} sqlitePath */
function persistDatabase(db, sqlitePath) {
  const dir = path.dirname(sqlitePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = db.export();
  fs.writeFileSync(sqlitePath, Buffer.from(data));
}

/** @param {*} db */
function closeDatabase(db) {
  try {
    db.close();
  } catch {
    /* ignore */
  }
}

module.exports = {
  initSchema,
  clearGraphTables,
  openOrCreateDatabase,
  persistDatabase,
  closeDatabase,
  SCHEMA_VERSION,
};
