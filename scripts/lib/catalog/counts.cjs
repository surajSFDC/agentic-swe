'use strict';

const path = require('node:path');
const { listAgentMarkdownFiles } = require('./walk-subagents.cjs');

const CATEGORY_LABELS = {
  'language-specialists': 'Language Specialists',
  'infrastructure': 'Infrastructure',
  'quality-security': 'Quality & Security',
  'data-ai': 'Data & AI',
  'developer-experience': 'Developer Experience',
  'specialized-domains': 'Specialized Domains',
  'business-product': 'Business & Product',
  'core-development': 'Core Development',
  'meta-orchestration': 'Meta & Orchestration',
  'research-analysis': 'Research & Analysis',
};

function computeCatalogCounts(subagentsRoot) {
  const files = listAgentMarkdownFiles(subagentsRoot);
  const byCategory = {};
  for (const f of files) {
    const cat = path.basename(path.dirname(f));
    if (cat === 'custom') continue;
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }
  const categories = Object.entries(byCategory)
    .map(([slug, count]) => ({ slug, label: CATEGORY_LABELS[slug] || slug, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  return { total, categories };
}

function renderTable(counts) {
  const lines = ['| Category | Count |', '|----------|------:|'];
  for (const c of counts.categories) {
    lines.push(`| ${c.label} | ${c.count} |`);
  }
  return lines.join('\n');
}

function renderInline(counts) {
  const parts = counts.categories.map((c) => `${c.label} (${c.count})`);
  return `Across ${counts.categories.length} categories — ${parts.join(', ')}.`;
}

function renderTotalBadge(counts) {
  return `https://img.shields.io/badge/subagents-${counts.total}%2B-purple.svg`;
}

function renderBadgeLine(counts) {
  return `  <a href="#subagents"><img src="${renderTotalBadge(counts)}" alt="Agents" /></a>`;
}

function renderTotalLine(counts) {
  return `**${counts.total}+ specialists** under **\`agents/subagents/\`**`;
}

function renderShortTotal(counts) {
  return `${counts.total}+ subagents`;
}

module.exports = {
  CATEGORY_LABELS,
  computeCatalogCounts,
  renderTable,
  renderInline,
  renderTotalBadge,
  renderBadgeLine,
  renderTotalLine,
  renderShortTotal,
};
