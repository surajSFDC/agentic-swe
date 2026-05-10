'use strict';

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Write an adversarial prompt + artifact + contract to a temp file.
 * Returns the temp file path.
 */
function writePromptFile(adversarialPrompt, artifact, contract) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `ddv-cross-model-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.md`);
  const content = [
    adversarialPrompt,
    '',
    'ARTIFACT:',
    artifact,
    '',
    'CONTRACT:',
    contract,
  ].join('\n');
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

/**
 * Build the invocation command for a given CLI.
 * Returns { command: string, args: string[], stdinFile: string }
 */
function buildInvocation(cliName, promptFile, repoPath) {
  switch (cliName) {
    case 'codex':
      return {
        command: 'codex',
        args: ['exec', '--sandbox', 'read-only', '-C', repoPath || process.cwd(), '-'],
        stdinFile: promptFile,
        display: `codex exec --sandbox read-only -C ${repoPath || process.cwd()} - < ${promptFile}`,
      };
    case 'gemini':
      return {
        command: 'gemini',
        args: ['--approval-mode', 'plan', '-p', ''],
        stdinFile: promptFile,
        display: `gemini --approval-mode plan -p "" < ${promptFile}`,
      };
    default:
      throw new Error(`Unsupported CLI: ${cliName}`);
  }
}

/**
 * Execute the cross-model invocation. Returns stdout or throws.
 * IMPORTANT: This should only be called after explicit user authorization.
 */
function execute(cliName, promptFile, repoPath, timeoutMs = 120000) {
  const inv = buildInvocation(cliName, promptFile, repoPath);
  const stdin = fs.readFileSync(inv.stdinFile, 'utf8');
  try {
    const output = execFileSync(inv.command, inv.args, {
      input: stdin,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 10,
    });
    return { success: true, output, command: inv.display };
  } catch (err) {
    return { success: false, error: err.message, command: inv.display };
  }
}

/**
 * Cleanup a temp prompt file.
 */
function cleanup(promptFile) {
  try {
    fs.unlinkSync(promptFile);
  } catch { /* ignore */ }
}

module.exports = { writePromptFile, buildInvocation, execute, cleanup };
