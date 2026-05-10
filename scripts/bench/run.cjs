'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Score a completed worklog against benchmark criteria.
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

if (require.main === module) {
  const workDir = process.argv[2];
  const taskDir = process.argv[3];

  if (!workDir) {
    console.error('Usage: node run.cjs <work-dir> [task-dir]');
    process.exit(1);
  }

  const scores = scoreWorklog(workDir, taskDir);
  console.log(JSON.stringify(scores, null, 2));
  process.exit(scores.total >= 0.6 ? 0 : 1);
}

module.exports = { scoreWorklog };
