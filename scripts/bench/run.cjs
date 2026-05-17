'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Scoring — given a completed worklog and task directory
// ---------------------------------------------------------------------------

/**
 * Score a completed worklog against benchmark criteria.
 *
 * @param {string} workDir  Path to .worklogs/<id> directory
 * @param {string} [taskDir] Path to bench/tasks/<id> directory
 * @returns {{ task_pass: number, cost_efficiency: number, cross_model: number, gate_respect: number, total: number, error?: string }}
 */
function scoreWorklog(workDir, taskDir) {
  const scores = {
    task_pass: 0,
    cost_efficiency: 0,
    cross_model: 0,
    gate_respect: 0,
    total: 0,
  };

  const stateFile = path.join(workDir, 'state.json');
  if (!fs.existsSync(stateFile)) {
    return { ...scores, error: 'state.json not found' };
  }

  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

  if (state.current_state === 'completed') {
    scores.task_pass = 1.0;
  } else if (state.current_state === 'pr-creation' || state.current_state === 'approval-wait') {
    scores.task_pass = 0.8;
  } else if (state.current_state === 'validation') {
    scores.task_pass = 0.5;
  }

  const costUsed = state.budget?.cost_used || 0;
  const costBudget = state.budget?.cost_budget_usd || 3.0;
  scores.cost_efficiency = costUsed <= costBudget ? 1.0 : Math.max(0, 1 - (costUsed - costBudget) / costBudget);

  const history = state.history || [];
  for (let i = 1; i < history.length; i++) {
    if (history[i - 1].to !== history[i].from) {
      scores.gate_respect -= 0.2;
    }
  }
  const budgetRespected = (state.budget?.budget_remaining || 0) >= 0;
  scores.gate_respect = Math.max(0, 1.0 + scores.gate_respect - (budgetRespected ? 0 : 0.3));

  const hasCrossModel = fs.existsSync(path.join(workDir, 'design-panel-review.md'));
  scores.cross_model = hasCrossModel ? 1.0 : 0.5;

  scores.total = (
    scores.task_pass * 0.4 +
    scores.cost_efficiency * 0.2 +
    scores.cross_model * 0.2 +
    scores.gate_respect * 0.2
  );

  return scores;
}

// ---------------------------------------------------------------------------
// Validation — load and structurally check a task directory, no LLM needed
// ---------------------------------------------------------------------------

const REQUIRED_TASK_FILES = [
  'task.json',
  'scoring.json',
  'repo/package.json',
  path.join('expected', 'patterns.json'),
];

const TASK_JSON_REQUIRED_FIELDS = [
  'id', 'title', 'description', 'expected_track', 'acceptance_tests',
];

const VALID_TRACKS = ['lean', 'standard', 'rigorous'];

const SCORING_JSON_REQUIRED_FIELDS = [
  'task_pass', 'cost_efficiency', 'cross_model', 'gate_respect',
];

/**
 * Validate a single task directory.
 *
 * @param {string} taskDir  Absolute or relative path to bench/tasks/<id>
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
function validateTask(taskDir) {
  const errors = [];
  const warnings = [];
  const abs = path.resolve(taskDir);

  if (!fs.existsSync(abs)) {
    return { ok: false, errors: [`Task directory not found: ${abs}`], warnings };
  }

  // 1. Required files present
  for (const rel of REQUIRED_TASK_FILES) {
    const full = path.join(abs, rel);
    if (!fs.existsSync(full)) {
      errors.push(`Missing required file: ${rel}`);
    }
  }

  // 2. task.json structure
  const taskJsonPath = path.join(abs, 'task.json');
  let taskJson = null;
  if (fs.existsSync(taskJsonPath)) {
    try {
      taskJson = JSON.parse(fs.readFileSync(taskJsonPath, 'utf8'));
    } catch (e) {
      errors.push(`task.json is not valid JSON: ${e.message}`);
    }
    if (taskJson) {
      for (const field of TASK_JSON_REQUIRED_FIELDS) {
        if (!taskJson[field]) {
          errors.push(`task.json missing required field: ${field}`);
        }
      }
      if (taskJson.expected_track && !VALID_TRACKS.includes(taskJson.expected_track)) {
        errors.push(`task.json.expected_track must be one of: ${VALID_TRACKS.join(', ')} (got: ${taskJson.expected_track})`);
      }
      // id must match directory basename
      const dirId = path.basename(abs);
      if (taskJson.id && taskJson.id !== dirId) {
        warnings.push(`task.json.id (${taskJson.id}) does not match directory name (${dirId})`);
      }
    }
  }

  // 3. scoring.json structure
  const scoringJsonPath = path.join(abs, 'scoring.json');
  let scoringJson = null;
  if (fs.existsSync(scoringJsonPath)) {
    try {
      scoringJson = JSON.parse(fs.readFileSync(scoringJsonPath, 'utf8'));
    } catch (e) {
      errors.push(`scoring.json is not valid JSON: ${e.message}`);
    }
    if (scoringJson) {
      for (const field of SCORING_JSON_REQUIRED_FIELDS) {
        if (!scoringJson[field]) {
          errors.push(`scoring.json missing required dimension: ${field}`);
        }
      }
      // Weights must sum to ~1.0
      let weightSum = 0;
      for (const field of SCORING_JSON_REQUIRED_FIELDS) {
        if (scoringJson[field] && typeof scoringJson[field].weight === 'number') {
          weightSum += scoringJson[field].weight;
        }
      }
      if (Math.abs(weightSum - 1.0) > 0.01) {
        errors.push(`scoring.json dimension weights must sum to 1.0 (got ${weightSum.toFixed(3)})`);
      }
    }
  }

  // 4. expected/patterns.json structure
  const patternsJsonPath = path.join(abs, 'expected', 'patterns.json');
  if (fs.existsSync(patternsJsonPath)) {
    try {
      const patternsJson = JSON.parse(fs.readFileSync(patternsJsonPath, 'utf8'));
      if (!Array.isArray(patternsJson.required_patterns)) {
        errors.push('expected/patterns.json must have a required_patterns array');
      }
      if (patternsJson.track_must_be && !VALID_TRACKS.includes(patternsJson.track_must_be)) {
        errors.push(`expected/patterns.json.track_must_be must be lean|standard|rigorous (got: ${patternsJson.track_must_be})`);
      }
    } catch (e) {
      errors.push(`expected/patterns.json is not valid JSON: ${e.message}`);
    }
  }

  // 5. repo must have at least one source file
  const repoSrc = path.join(abs, 'repo', 'src');
  if (fs.existsSync(repoSrc)) {
    const srcFiles = fs.readdirSync(repoSrc).filter((f) => f.endsWith('.js'));
    if (srcFiles.length === 0) {
      warnings.push('repo/src/ has no .js files');
    }
  } else {
    warnings.push('repo/src/ directory not found');
  }

  // 6. repo must have at least one test file
  const repoTest = path.join(abs, 'repo', 'test');
  if (fs.existsSync(repoTest)) {
    const testFiles = fs.readdirSync(repoTest).filter((f) => f.endsWith('.js'));
    if (testFiles.length === 0) {
      warnings.push('repo/test/ has no .js test files');
    }
  } else {
    warnings.push('repo/test/ directory not found');
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Discover all task directories under a bench/tasks root.
 *
 * @param {string} tasksRoot
 * @returns {string[]} sorted list of task directory paths
 */
function discoverTasks(tasksRoot) {
  if (!fs.existsSync(tasksRoot)) return [];
  return fs.readdirSync(tasksRoot)
    .filter((name) => {
      const full = path.join(tasksRoot, name);
      return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'task.json'));
    })
    .sort()
    .map((name) => path.join(tasksRoot, name));
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  // Legacy: node run.cjs <work-dir> [task-dir]  (no subcommand)
  if (subcommand && !['validate', 'score'].includes(subcommand)) {
    const workDir = args[0];
    const taskDir = args[1];
    const scores = scoreWorklog(workDir, taskDir);
    console.log(JSON.stringify(scores, null, 2));
    process.exit(scores.total >= 0.6 ? 0 : 1);
  }

  if (subcommand === 'score') {
    const workDir = args[1];
    const taskDir = args[2];
    if (!workDir) {
      console.error('Usage: node run.cjs score <work-dir> [task-dir]');
      process.exit(1);
    }
    const scores = scoreWorklog(workDir, taskDir);
    console.log(JSON.stringify(scores, null, 2));
    process.exit(scores.total >= 0.6 ? 0 : 1);
  }

  if (subcommand === 'validate') {
    // node run.cjs validate [--task <id>|--all] [--tasks-root <path>]
    const taskIdIdx = args.indexOf('--task');
    const allFlag = args.includes('--all');
    const tasksRootIdx = args.indexOf('--tasks-root');

    const defaultTasksRoot = path.resolve(__dirname, '../../bench/tasks');
    const tasksRoot = tasksRootIdx !== -1 ? path.resolve(args[tasksRootIdx + 1]) : defaultTasksRoot;

    let taskDirs = [];
    if (taskIdIdx !== -1) {
      const taskId = args[taskIdIdx + 1];
      taskDirs = [path.join(tasksRoot, taskId)];
    } else if (allFlag) {
      taskDirs = discoverTasks(tasksRoot);
    } else {
      // default: validate all discovered tasks
      taskDirs = discoverTasks(tasksRoot);
    }

    if (taskDirs.length === 0) {
      console.error(`No tasks found under: ${tasksRoot}`);
      process.exit(1);
    }

    let allOk = true;
    for (const taskDir of taskDirs) {
      const taskId = path.basename(taskDir);
      const result = validateTask(taskDir);
      if (result.ok) {
        console.log(`[PASS] ${taskId}`);
      } else {
        console.log(`[FAIL] ${taskId}`);
        allOk = false;
      }
      for (const err of result.errors) {
        console.log(`       ERROR: ${err}`);
      }
      for (const warn of result.warnings) {
        console.log(`       WARN:  ${warn}`);
      }
    }

    console.log('');
    console.log(`Validated ${taskDirs.length} task(s). ${allOk ? 'All passed.' : 'Some failed.'}`);
    process.exit(allOk ? 0 : 1);
  }

  // No subcommand and no work-dir
  console.error('Usage:');
  console.error('  node run.cjs validate [--task <id>] [--all] [--tasks-root <path>]');
  console.error('  node run.cjs score <work-dir> [task-dir]');
  console.error('  node run.cjs <work-dir> [task-dir]   (legacy)');
  process.exit(1);
}

module.exports = { scoreWorklog, validateTask, discoverTasks };
