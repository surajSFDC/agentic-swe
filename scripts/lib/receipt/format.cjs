function formatCost(usd) {
  return `$${Number(usd).toFixed(2)}`;
}

function formatDurationHuman(seconds) {
  if (seconds < 60) return `${seconds} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hrs} hr ${mins} min`;
}

function formatMarkdown(data) {
  const lines = [];
  const headline = data.task ? `# /work ${data.workId} — ${data.task}` : `# /work ${data.workId}`;
  lines.push(headline, '');
  lines.push('| Field | Value |');
  lines.push('|---|---|');
  lines.push(`| Work ID | ${data.workId} |`);
  lines.push(`| Track | ${data.track} |`);
  lines.push(`| Status | ${data.status} |`);
  if (data.durationSeconds != null) lines.push(`| Duration | ${formatDurationHuman(data.durationSeconds)} |`);
  lines.push(`| Cost | ${formatCost(data.costUsd)} |`);
  if (data.prUrl) lines.push(`| PR | ${data.prUrl} |`);
  lines.push('');
  if (data.decisions.length > 0) {
    lines.push(`## Decisions made (${data.decisions.length})`, '');
    data.decisions.forEach((d, i) => {
      const line = `${i + 1}. **${d.phase} → ${d.destination}** (${formatCost(d.costUsd)}) — ${d.reason || 'no reason recorded'}`;
      const evidence = d.evidenceRefs.length > 0 ? ` → ${d.evidenceRefs.join(', ')}` : '';
      lines.push(line + evidence);
    });
    lines.push('');
  }
  if (data.humanGates.length > 0) {
    lines.push(`## Human gates respected (${data.humanGates.length})`, '');
    data.humanGates.forEach((g) => {
      lines.push(`- \`${g.state}\` resolved by ${g.resolvedBy} at ${g.at} — ${g.reason}`);
    });
    lines.push('');
  }
  const counterEntries = Object.entries(data.counters);
  if (counterEntries.length > 0) {
    lines.push('## Loop counters', '');
    counterEntries.forEach(([k, v]) => lines.push(`- \`${k}\`: ${v}`));
    lines.push('');
  }
  lines.push('## Verifiable references', '');
  lines.push(`- All artifacts: \`${data.workDir}/\``);
  lines.push(`- Audit log: \`${data.workDir}/audit.log\` (${data.auditEntryCount} entries)`);
  lines.push('');
  return lines.join('\n');
}

function formatJson(data) {
  return JSON.stringify(data, null, 2);
}

module.exports = { formatMarkdown, formatJson, formatCost, formatDurationHuman };
