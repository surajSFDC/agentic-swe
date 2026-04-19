#!/usr/bin/env node
/**
 * Build / refresh the local deterministic project graph (SQLite) for Phase 2 memory.
 *
 * Usage:
 *   node scripts/memory-index.cjs [--project-root <dir>] [--plugin-root <dir>] [--json]
 */
'use strict';

const path = require('node:path');
const { getDefaultPluginRoot } = require('./lib/work-engine/engine.cjs');
const { ingestGraphProject } = require('./lib/memory/graph-ingest.cjs');
const { queryGraphStats } = require('./lib/memory/graph-query.cjs');

function parseArgs(argv) {
  const out = { json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--project-root') out.projectRoot = path.resolve(argv[++i]);
    else if (a === '--plugin-root') out.pluginRoot = path.resolve(argv[++i]);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const projectRoot = args.projectRoot || process.cwd();
  const pluginRoot = args.pluginRoot || getDefaultPluginRoot();

  const r = await ingestGraphProject({ projectRoot, pluginRoot });
  const stats = await queryGraphStats(r.sqlitePath);

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          sqlitePath: r.sqlitePath,
          ingest: r.stats,
          query: stats,
          skipped: r.skipped === true,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`memory-index: wrote ${r.sqlitePath}`);
  console.log(`  nodes: ${stats.nodes}  edges: ${stats.edges}`);
  if (stats.kinds && stats.kinds.nodes) {
    console.log(`  node kinds: ${JSON.stringify(stats.kinds.nodes)}`);
  }
  if (stats.kinds && stats.kinds.edges) {
    console.log(`  edge kinds: ${JSON.stringify(stats.kinds.edges)}`);
  }
}

main().catch((e) => {
  console.error(e && e.stack ? e.stack : e);
  process.exit(1);
});
