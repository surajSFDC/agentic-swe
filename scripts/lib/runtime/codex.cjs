'use strict';

/**
 * Codex runtime adapter.
 * Translates typed actions into Codex tool invocations.
 */
const TOOL_MAP = {
  READ_FILE: (action) => ({ tool: 'read_file', params: { path: action.path } }),
  WRITE_FILE: (action) => ({ tool: 'write_file', params: { path: action.path, content: action.contents } }),
  EDIT_FILE: (action) => ({ tool: 'patch', params: { path: action.path, diff: action.diff } }),
  RUN: (action) => ({ tool: 'shell', params: { command: action.command } }),
  SEARCH: (action) => ({ tool: 'shell', params: { command: `rg "${action.pattern}" ${action.path || '.'}` } }),
  GLOB: (action) => ({ tool: 'shell', params: { command: `find ${action.path || '.'} -name "${action.pattern}"` } }),
  SPAWN_SUBAGENT: (action) => ({ tool: 'spawn_agent', params: { prompt: action.prompt } }),
  LIST_DIR: (action) => ({ tool: 'list_dir', params: { path: action.path } }),
  GIT: (action) => ({ tool: 'shell', params: { command: `git ${action.subcommand}` } }),
  WEB_FETCH: (action) => ({ tool: 'shell', params: { command: `curl -sL "${action.url}"` } }),
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
