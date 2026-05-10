'use strict';

/**
 * Gemini CLI runtime adapter.
 * Translates typed actions into Gemini tool invocations.
 */
const TOOL_MAP = {
  READ_FILE: (action) => ({ tool: 'read_file', params: { path: action.path } }),
  WRITE_FILE: (action) => ({ tool: 'write_file', params: { path: action.path, content: action.contents } }),
  EDIT_FILE: (action) => ({ tool: 'edit_file', params: { path: action.path, find: action.old_string, replace: action.new_string } }),
  RUN: (action) => ({ tool: 'run_shell_command', params: { command: action.command } }),
  SEARCH: (action) => ({ tool: 'search_files', params: { query: action.pattern, path: action.path } }),
  GLOB: (action) => ({ tool: 'list_directory', params: { path: action.path } }),
  SPAWN_SUBAGENT: (action) => ({ tool: 'run_shell_command', params: { command: `gemini -p "" <<< "${action.prompt}"` } }),
  LIST_DIR: (action) => ({ tool: 'list_directory', params: { path: action.path } }),
  GIT: (action) => ({ tool: 'run_shell_command', params: { command: `git ${action.subcommand}` } }),
  WEB_FETCH: (action) => ({ tool: 'web_fetch', params: { url: action.url } }),
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
