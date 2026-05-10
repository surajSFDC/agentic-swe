'use strict';

/**
 * Claude Code runtime adapter.
 * Translates typed actions into Claude Code tool invocations.
 */
const TOOL_MAP = {
  READ_FILE: (action) => ({ tool: 'Read', params: { path: action.path, offset: action.offset, limit: action.limit } }),
  WRITE_FILE: (action) => ({ tool: 'Write', params: { path: action.path, contents: action.contents } }),
  EDIT_FILE: (action) => ({ tool: 'Edit', params: { file_path: action.path, old_string: action.old_string, new_string: action.new_string } }),
  RUN: (action) => ({ tool: 'Bash', params: { command: action.command, timeout: action.timeout_ms } }),
  SEARCH: (action) => ({ tool: 'Grep', params: { pattern: action.pattern, path: action.path } }),
  GLOB: (action) => ({ tool: 'Glob', params: { pattern: action.pattern, path: action.path } }),
  SPAWN_SUBAGENT: (action) => ({ tool: 'Task', params: { prompt: action.prompt, description: action.description, run_in_background: action.background } }),
  LIST_DIR: (action) => ({ tool: 'LS', params: { path: action.path } }),
  GIT: (action) => ({ tool: 'Bash', params: { command: `git ${action.subcommand}` } }),
  WEB_FETCH: (action) => ({ tool: 'WebFetch', params: { url: action.url } }),
};

function translate(action) {
  const translator = TOOL_MAP[action.type];
  if (!translator) throw new Error(`Unknown action type: ${action.type}`);
  return translator(action);
}

function translateAll(actions) {
  return actions.map(translate);
}

module.exports = { translate, translateAll, TOOL_MAP };
