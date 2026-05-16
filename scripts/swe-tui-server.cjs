#!/usr/bin/env node
/**
 * Terminal UI for agentic-swe — live cockpit displaying pipeline state.
 *
 * Usage:
 *   node scripts/swe-tui-server.cjs [--work-dir <path>] [--cwd <repo>] [--all] [--interactive]
 *
 * Pure Node.js built-ins only. No native modules. SSH/headless safe.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const NO_COLOR = process.env.NO_COLOR !== undefined || process.env.TERM === 'dumb';
const IS_TTY = process.stdout.isTTY;

function ansi(code) {
  return NO_COLOR || !IS_TTY ? '' : `\x1b[${code}m`;
}

const C = {
  reset: ansi('0'),
  bold: ansi('1'),
  dim: ansi('2'),
  cyan: ansi('36'),
  green: ansi('32'),
  yellow: ansi('33'),
  red: ansi('31'),
  blue: ansi('34'),
  magenta: ansi('35'),
  white: ansi('37'),
  brightCyan: ansi('96'),
  brightGreen: ansi('92'),
  brightYellow: ansi('93'),
};

// ─── ASCII mascot ─────────────────────────────────────────────────────────────

const MASCOT_LINES = [
  ' /▔▔\\',
  ' |◉◉|',
  '  \\_/ ',
  '  | | ',
];

// ─── Layout helpers ───────────────────────────────────────────────────────────

/**
 * Render a Unicode progress bar of given width.
 * @param {number} remaining
 * @param {number} total
 * @param {number} width bar character count
 */
function formatBudgetBar(remaining, total, width) {
  const filled = total > 0 ? Math.round((remaining / total) * width) : 0;
  const empty = width - filled;
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));
}

/**
 * Decide layout: 'side-by-side' or 'stacked'.
 * Side-by-side only when terminal is wide enough and there are 2+ items.
 * @param {number} itemCount
 * @param {number} termWidth
 */
function chooseLayout(itemCount, termWidth) {
  if (itemCount >= 2 && termWidth >= 120) return 'side-by-side';
  return 'stacked';
}

/**
 * Discover the newest non-completed work item directory under <cwd>/.worklogs/.
 * @param {string} cwd
 * @returns {string|null}
 */
function discoverWorkDir(cwd) {
  const wlRoot = path.join(cwd, '.worklogs');
  if (!fs.existsSync(wlRoot)) return null;

  const dirs = fs.readdirSync(wlRoot)
    .map(d => {
      const stateFile = path.join(wlRoot, d, 'state.json');
      if (!fs.existsSync(stateFile)) return null;
      try {
        const s = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (s.current_state === 'completed') return null;
        return { dir: path.join(wlRoot, d), updatedAt: s.updated_at || '' };
      } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return dirs.length > 0 ? dirs[0].dir : null;
}

/**
 * Discover all non-completed work items.
 * @param {string} cwd
 * @returns {string[]}
 */
function discoverAllWorkDirs(cwd) {
  const wlRoot = path.join(cwd, '.worklogs');
  if (!fs.existsSync(wlRoot)) return [];

  return fs.readdirSync(wlRoot)
    .map(d => {
      const stateFile = path.join(wlRoot, d, 'state.json');
      if (!fs.existsSync(stateFile)) return null;
      try {
        const s = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (s.current_state === 'completed') return null;
        return { dir: path.join(wlRoot, d), updatedAt: s.updated_at || '' };
      } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(x => x.dir);
}

/**
 * Read and parse state.json from a work dir. Returns null on error.
 * @param {string} workDir
 */
function readState(workDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(workDir, 'state.json'), 'utf8'));
  } catch { return null; }
}

// ─── Rendering ────────────────────────────────────────────────────────────────

const STATE_COLOR = {
  'initialized': C.dim,
  'feasibility': C.cyan,
  'lean-track-check': C.cyan,
  'design': C.blue,
  'design-review': C.blue,
  'verification': C.yellow,
  'test-strategy': C.yellow,
  'implementation': C.brightCyan,
  'self-review': C.cyan,
  'code-review': C.cyan,
  'permissions-check': C.yellow,
  'validation': C.green,
  'pr-creation': C.green,
  'approval-wait': C.brightYellow,
  'completed': C.brightGreen,
  'ambiguity-wait': C.red,
  'escalate-code': C.red,
  'escalate-validation': C.red,
  'pipeline-failed': C.red,
};

function stateColor(state) {
  return STATE_COLOR[state] || C.white;
}

/**
 * Render a single work item as a multi-line string.
 * @param {object} state  parsed state.json
 * @param {{ ansi: boolean, width: number }} opts
 * @returns {string}
 */
function renderWorkItem(state, opts = {}) {
  const { ansi: useAnsi = IS_TTY && !NO_COLOR, width = 80 } = opts;
  const reset = useAnsi ? C.reset : '';
  const bold = useAnsi ? C.bold : '';
  const dim = useAnsi ? C.dim : '';
  const sc = useAnsi ? stateColor(state.current_state) : '';
  const green = useAnsi ? C.green : '';
  const yellow = useAnsi ? C.yellow : '';

  const workId = state.work_id || 'unknown';
  const curState = state.current_state || 'unknown';
  const track = state.pipeline?.track || '—';
  const branch = state.git?.working_branch || '—';
  const budgetRem = state.budget?.budget_remaining ?? '?';
  const budgetTotal = state.budget?.iteration_budget ?? 10;
  const costUsed = (state.budget?.cost_used || 0).toFixed(2);
  const costBudget = (state.budget?.cost_budget_usd || 3.0).toFixed(2);

  const barWidth = 10;
  const bar = formatBudgetBar(budgetRem, budgetTotal, barWidth);
  const barColored = useAnsi
    ? `${green}${bar.slice(0, Math.round(budgetRem / budgetTotal * barWidth))}${dim}${bar.slice(Math.round(budgetRem / budgetTotal * barWidth))}${reset}`
    : bar;

  const recentHistory = (state.history || []).slice(-3).reverse();
  const historyLines = recentHistory.map(h => {
    const ts = (h.at || h.timestamp || '').slice(11, 16);
    return `  ${dim}${ts}${reset}  ${h.from} → ${sc}${h.to}${reset}`;
  });

  const innerWidth = width - 4;
  const divider = '─'.repeat(innerWidth);

  const lines = [
    `┌─${bold} ${workId} ${reset}${'─'.repeat(Math.max(0, innerWidth - workId.length - 3))}┐`,
    `│  ${sc}${bold}${curState.padEnd(22)}${reset}  track: ${track.padEnd(10)}${' '.repeat(Math.max(0, innerWidth - 40))}│`,
    `│  branch: ${dim}${branch.slice(0, innerWidth - 12)}${reset}${' '.repeat(Math.max(0, innerWidth - 10 - Math.min(branch.length, innerWidth - 12)))}│`,
    `│  iter: ${barColored} ${String(budgetRem).padStart(2)}/${budgetTotal}  cost: $${costUsed}/$${costBudget}${' '.repeat(Math.max(0, innerWidth - 40))}│`,
    `├─${divider}─┤`,
    `│  ${dim}recent transitions${reset}${' '.repeat(Math.max(0, innerWidth - 20))}│`,
    ...historyLines.slice(0, 3).map(l => `│${l.padEnd(innerWidth + 2)}│`),
    `└${'─'.repeat(innerWidth + 2)}┘`,
  ];

  return lines.join('\n');
}

function renderMascotHeader(version) {
  if (!IS_TTY || NO_COLOR) return '';
  const v = version || '';
  return [
    `${C.brightCyan}${C.bold}  ╭────────────────────────────────────────╮${C.reset}`,
    `${C.brightCyan}${C.bold}  │  ◈  agentic-swe ${v.padEnd(10)}  live cockpit  │${C.reset}`,
    `${C.brightCyan}  │${C.reset}${MASCOT_LINES[0].padEnd(16)} ${C.dim}watching pipeline...${C.reset}${C.brightCyan}        │${C.reset}`,
    `${C.brightCyan}  │${C.reset}${MASCOT_LINES[1].padEnd(16)} ${C.dim}press Ctrl+C to exit${C.reset}${C.brightCyan}        │${C.reset}`,
    `${C.brightCyan}  │${C.reset}${MASCOT_LINES[2].padEnd(16)}${' '.repeat(28)}${C.brightCyan}│${C.reset}`,
    `${C.brightCyan}  │${C.reset}${MASCOT_LINES[3].padEnd(16)}${' '.repeat(28)}${C.brightCyan}│${C.reset}`,
    `${C.brightCyan}${C.bold}  ╰────────────────────────────────────────╯${C.reset}`,
  ].join('\n');
}

// ─── CLI arg parsing ──────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  let workDir = null;
  let cwd = process.cwd();
  let all = false;
  let interactive = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--work-dir' && args[i + 1]) workDir = path.resolve(args[++i]);
    else if (a === '--cwd' && args[i + 1]) cwd = path.resolve(args[++i]);
    else if (a === '--all') all = true;
    else if (a === '--interactive') interactive = true;
    else if (a === '--help' || a === '-h') {
      process.stdout.write(
        'Usage: node scripts/swe-tui-server.cjs [--work-dir <path>] [--cwd <repo>] [--all] [--interactive]\n'
      );
      process.exit(0);
    }
  }
  return { workDir, cwd, all, interactive };
}

// ─── Main render loop ─────────────────────────────────────────────────────────

function clearScreen() {
  if (IS_TTY && !NO_COLOR) process.stdout.write('\x1b[2J\x1b[H');
}

function render(workDirs) {
  const termWidth = process.stdout.columns || 100;
  clearScreen();

  let version = 'v?.?.?';
  try {
    version = 'v' + JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version;
  } catch { /* ignore */ }

  const header = renderMascotHeader(version);
  if (header) process.stdout.write(header + '\n\n');

  const states = workDirs.map(d => ({ dir: d, state: readState(d) })).filter(x => x.state);

  if (states.length === 0) {
    process.stdout.write(`${C.dim}No active work items found. Start work with /work.${C.reset}\n`);
    return;
  }

  const layout = chooseLayout(states.length, termWidth);

  if (layout === 'side-by-side' && states.length === 2) {
    const halfWidth = Math.floor((termWidth - 2) / 2);
    const left = renderWorkItem(states[0].state, { width: halfWidth });
    const right = renderWorkItem(states[1].state, { width: halfWidth });
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const maxLines = Math.max(leftLines.length, rightLines.length);
    for (let i = 0; i < maxLines; i++) {
      const l = (leftLines[i] || '').padEnd(halfWidth + 2);
      const r = rightLines[i] || '';
      process.stdout.write(l + '  ' + r + '\n');
    }
  } else {
    for (const { state } of states) {
      process.stdout.write(renderWorkItem(state, { width: Math.min(termWidth, 100) }) + '\n\n');
    }
  }

  process.stdout.write(`\n${C.dim}[${new Date().toISOString().slice(11, 19)} UTC] auto-refreshing every 2s${C.reset}\n`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

if (require.main === module) {
  const { workDir, cwd, all, interactive } = parseArgs(process.argv);

  let workDirs;
  if (workDir) {
    workDirs = [workDir];
  } else if (all) {
    workDirs = discoverAllWorkDirs(cwd);
  } else {
    const found = discoverWorkDir(cwd);
    workDirs = found ? [found] : [];
  }

  if (workDirs.length === 0) {
    process.stdout.write('No active work items found under ' + cwd + '\n');
    process.exit(0);
  }

  render(workDirs);

  const watchers = [];
  for (const dir of workDirs) {
    try {
      const watcher = fs.watch(dir, { persistent: false }, () => render(workDirs));
      watchers.push(watcher);
    } catch { /* fallback to polling */ }
  }

  const pollInterval = setInterval(() => render(workDirs), 2000);

  if (IS_TTY) {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.on('keypress', (_, key) => {
      if (key && (key.ctrl && key.name === 'c')) {
        clearInterval(pollInterval);
        watchers.forEach(w => w.close());
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdout.write('\n');
        process.exit(0);
      }
    });
  }

  process.on('SIGINT', () => {
    clearInterval(pollInterval);
    watchers.forEach(w => w.close());
    process.stdout.write('\n');
    process.exit(0);
  });
}

module.exports = { formatBudgetBar, discoverWorkDir, discoverAllWorkDirs, renderWorkItem, chooseLayout };
