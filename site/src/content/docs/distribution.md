# Distribution model

How users get **agentic-swe**, and how that relates to **source hosting** (e.g. GitHub).

## Channels

| Channel | Role |
|---------|------|
| **Claude Code plugin marketplace** | **Primary.** Git-hosted catalog ([`.claude-plugin/marketplace.json`](../../.claude-plugin/marketplace.json)); users add the repo then **`/plugin install`** — see [claude-code-plugin.md](claude-code-plugin.md) |
| **Cursor** | **Local:** [`scripts/install-cursor-plugin.sh`](../../scripts/install-cursor-plugin.sh) clones or symlinks into **`~/.cursor/plugins/local/agentic-swe`** (documented on [cursor-plugin.md](cursor-plugin.md)). **Marketplace:** submit the same Git repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) for in-IDE discovery (Cursor reviews listings). |
| **Source hosting** | Development, issues, contributions, and **`claude --plugin-dir`** local dev |
| **Marketing / docs site** | Landing page and markdown docs on **[GitHub Pages](https://surajSFDC.github.io/agentic-swe/)**; describes plugin install |
| **[Anthropic plugin directory](https://claude.com/plugins)** (optional) | Curated catalog; **separate** from the Git marketplace. Submit via Anthropic’s form; **track submissions:** [claude.ai — Settings → Plugins → Submissions](https://claude.ai/settings/plugins/submissions) |

## Marketing and documentation site

- **GitHub Pages (public URL)** — [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml): on push to **`main`**, build with **`VITE_BASE=/<repo>/`** and publish **`site/dist/`**. **Settings → Pages → Source: GitHub Actions**. Example: **`https://surajSFDC.github.io/agentic-swe/`** (adjust for forks). README and **`package.json` `homepage`** point here.
- **Custom domain (optional)** — Configure a custom domain in the repository’s **GitHub Pages** settings and DNS per [GitHub’s custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## What gets deployed

**GitHub Actions** runs **`npm run build:site`** (Vite app in **`site/`**) and uploads **`site/dist/`** as the Pages artifact. Documentation pages are bundled from **`site/src/content/docs/*.md`** into the app (routes under **`/docs/*`**).

## Alignment with product

- README and the public site describe install via the **Claude Code plugin** and link to the [installation](installation.md) doc.
- Hero CTAs in **`site/src/`** should point users at **plugin marketplace** flows only.

## Release verification (maintainers)

Automated stub tests and manual per-host smoke before tags are on the [Release checklist](release-checklist.md) page.
