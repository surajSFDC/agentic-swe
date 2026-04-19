#!/usr/bin/env node
/**
 * Build semantic embedding index for subagent catalog (writes .agentic-swe/catalog-embeddings.json).
 * Uses embeddings config from config/catalog.default.json + .agentic-swe/catalog.json merge.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { resolveEmbeddingRuntime, embedText } = require('./lib/memory/embeddings-backend.cjs');
const { loadMergedCatalogConfig, resolveCatalogIndexPath } = require('./lib/catalog/catalog-config.cjs');
const { listAgentMarkdownFiles } = require('./lib/catalog/walk-subagents.cjs');
const { agentSearchBlob } = require('./lib/catalog/lexical-rank.cjs');

function parseArgs(argv) {
  const args = argv.slice(2);
  let projectRoot = process.cwd();
  let pluginRoot = path.join(__dirname, '..');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project-root' && args[i + 1]) {
      projectRoot = path.resolve(args[++i]);
      continue;
    }
    if (args[i] === '--plugin-root' && args[i + 1]) {
      pluginRoot = path.resolve(args[++i]);
      continue;
    }
  }
  return { projectRoot, pluginRoot };
}

async function main() {
  const { projectRoot, pluginRoot } = parseArgs(process.argv);
  const merged = loadMergedCatalogConfig(pluginRoot, projectRoot);
  const emb = merged.embeddings || {};
  if (!emb.enabled) {
    console.error('catalog-index: embeddings disabled in catalog config; enable embeddings.enabled');
    process.exit(1);
  }
  const rt = resolveEmbeddingRuntime(merged);
  if (!rt) {
    console.error(
      'catalog-index: no embedding backend resolved (set embeddings.provider to test|ollama|openai, or AGENTIC_SWE_EMBEDDINGS_BACKEND)'
    );
    process.exit(1);
  }

  const subagentsDir = path.resolve(
    process.env.AGENTIC_SWE_SUBAGENTS_DIR || path.join(pluginRoot, 'agents', 'subagents')
  );
  const files = listAgentMarkdownFiles(subagentsDir);
  if (files.length === 0) {
    console.error(`catalog-index: no agents under ${subagentsDir}`);
    process.exit(1);
  }

  const out = {
    schema_version: 1,
    model_id: rt.modelId,
    dim: 0,
    agents: [],
  };

  for (const abs of files) {
    const cat = path.basename(path.dirname(abs));
    const base = path.basename(abs, '.md');
    const id = `${cat}/${base}`;
    const raw = fs.readFileSync(abs, 'utf8');
    const blob = agentSearchBlob(raw, id);
    const text = String(blob.text).slice(0, 8000);
    const { vec, dim, modelId } = await embedText(text, rt);
    out.dim = dim;
    out.model_id = modelId;
    out.agents.push({ id, vec: Array.from(vec) });
  }

  const indexPath = resolveCatalogIndexPath(merged, projectRoot);
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(out) + '\n', 'utf8');
  console.log(`catalog-index: wrote ${out.agents.length} vectors (${out.dim}d, ${out.model_id}) -> ${indexPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
