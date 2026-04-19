'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * @param {string} root absolute path to agents/subagents
 * @returns {string[]} .md file paths
 */
function listAgentMarkdownFiles(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const cat of fs.readdirSync(root, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    const dir = path.join(root, cat.name);
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!f.isFile() || !f.name.endsWith('.md')) continue;
      out.push(path.join(dir, f.name));
    }
  }
  return out.sort();
}

module.exports = { listAgentMarkdownFiles };
