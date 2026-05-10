# Publishing & installation channels

This repo ships **one markdown pack** with multiple install surfaces: Claude Code (Git marketplace), optional **npm** tarball (**scoped** package), Cursor local plugins, and other hosts.

## Claude Code — custom Git marketplace

The canonical catalog lives in **`.claude-plugin/marketplace.json`** on **`main`** in **`agentic-swe/agentic-swe`**. Consumers add:

```text
/plugin marketplace add agentic-swe/agentic-swe
/plugin install agentic-swe@agentic-swe-catalog
```

**To publish an update:** merge **`main`**, keep **`package.json`** and marketplace/plugin versions in sync (**`npm run version:bump`** / **`bash scripts/bump-version.sh bump <semver>`**), run **`npm test`**, push. Users refresh the marketplace and reinstall or pin **`agentic-swe@<version>`**.

Optional **git tag** for humans and docs (not required for Git marketplace discovery):

```bash
git tag -a vX.Y.Z -m "agentic-swe vX.Y.Z"
git push origin vX.Y.Z
```

## Claude Code — Anthropic plugin directory (optional)

Listing in Anthropic’s directory is separate from the Git marketplace. Follow current submission guidance: [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) and your Claude Code **Settings → Plugins → Submissions** flow.

## npm — `@agentic-swe/agentic-swe`

The **unscoped** name **`agentic-swe`** on the public npm registry is **not** this project (different publisher). This pack publishes as:

```bash
npm install -g @agentic-swe/agentic-swe --registry=https://registry.npmjs.org/
```

**Maintainers:** create/use an npm account with publish rights to the **`@agentic-swe`** scope (npm org must match or scope ownership must allow your user).

```bash
npm login --registry=https://registry.npmjs.org/
npm publish --registry=https://registry.npmjs.org/
```

**`prepublishOnly`** runs **`version:check`** + **`verify`** (does not run the full **`npm test`** suite — run **`npm test`** locally before publishing).

The packed tarball **excludes** **`agents/plugin-runtime/brainstorm-server/node_modules`** (see **`package.json`** **`files`**). Install brainstorm deps when needed: **`npm ci --prefix agents/plugin-runtime/brainstorm-server`**.

After install, **`agentic-swe path`** prints the absolute pack root (same layout as a Git checkout). Use:

```bash
claude --plugin-dir "$(agentic-swe path)"
```

## Cursor — local plugin symlink

**Preferred:** install script clones or symlinks into **`~/.cursor/plugins/local/agentic-swe`**:

```bash
curl -fsSL https://raw.githubusercontent.com/agentic-swe/agentic-swe/main/scripts/install-cursor-plugin.sh | bash
```

**After npm global install**, point the script at the same tree:

```bash
export AGENTIC_SWE_PACK_ROOT="$(agentic-swe path)"
curl -fsSL https://raw.githubusercontent.com/agentic-swe/agentic-swe/main/scripts/install-cursor-plugin.sh | bash
```

See the site doc [Cursor plugin](https://agentic-swe.github.io/agentic-swe-site/docs/cursor-plugin) for **`CLAUDE.md`** merge options.

## Version sync

All of these must match **`package.json`** **`version`**:

- **`.claude-plugin/plugin.json`**
- **`.claude-plugin/marketplace.json`** (`plugins[0].version`)
- **`.cursor-plugin/plugin.json`**
- **`gemini-extension.json`**

Run **`npm run version:check`** after edits.
