export function SupportPage() {
  return (
    <main className="page-main reveal visible">
      <p className="section-label">// help</p>
      <h1>Support &amp; troubleshooting</h1>

      <h2>
        Slash commands like <code>/work</code> are missing
      </h2>
      <p>
        Install the pack into <strong>your project</strong> first (<code>npx agentic-swe /path/to/project</code>).
        Commands come from <code>.claude/commands/</code> in that tree. Open Claude Code in <strong>that</strong>{' '}
        directory.
      </p>

      <h2>“Target is not a git repository”</h2>
      <p>
        The installer warns when the path is not a git repo. Use <code>-y</code> / <code>--yes</code> for sandboxes,
        or run <code>git init</code> in the project.
      </p>

      <h2>Partial install</h2>
      <p>
        Re-run the same install command; it refreshes <code>.claude/</code> and the merged policy block when the
        delimiter is present. See the <a href="/installation.md">installation guide</a>.
      </p>

      <h2>Budget or gate stops every time</h2>
      <p>
        Run <code>/check budget</code> and inspect <code>.claude/.work/&lt;id&gt;/state.json</code>. See{' '}
        <a href="/check-commands.md">check commands</a>.
      </p>

      <h2>Wrong state after upgrading the pack</h2>
      <p>
        Major releases may change <code>state.json</code> or the state machine. Use{' '}
        <code>node scripts/migrate-work-state.js</code> (dry-run, then <code>--apply</code>) from the installed package
        or this repo. Read the project changelog. Edges must match the Hypervisor policy and{' '}
        <code>.claude/state-machine.json</code>.
      </p>

      <h2>Doctor</h2>
      <pre>agentic-swe doctor /path/to/your/project</pre>
      <p>
        Verifies Node, git, and core <code>.claude/</code> folders.
      </p>

      <h2>License</h2>
      <p>
        Open-source terms are summarized in the <a href="/licensing.md">licensing overview</a> (see repo{' '}
        <code>LICENSE</code> for the full text).
      </p>

      <h2>Issues &amp; contributions</h2>
      <p>
        Bug reports and feature discussion:{' '}
        <a href="https://github.com/surajSFDC/agentic-swe/issues" target="_blank" rel="noopener noreferrer">
          GitHub issues
        </a>
        .
      </p>

      <div className="doc-see-also">
        <strong>Full troubleshooting</strong> — <a href="/troubleshooting.md">Troubleshooting guide</a> ·{' '}
        <a href="/guide">Guide</a> ·{' '}
        <a href="/guide#commands">Commands</a>
      </div>
    </main>
  )
}
