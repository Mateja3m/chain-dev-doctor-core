import type { PipelineReport } from '@idoa/dev-doctor-types';

export function createJsonReport(report: PipelineReport): string {
  return JSON.stringify(report, null, 2);
}

export function createTerminalReport(report: PipelineReport): string {
  const lines: string[] = [];

  lines.push('Chain Dev Doctor Report');
  lines.push('=======================');
  lines.push(`Started: ${report.startedAt}`);
  lines.push(`Finished: ${report.finishedAt}`);
  lines.push(`Duration: ${report.durationMs}ms`);
  lines.push(
    `Summary: total=${report.summary.total} pass=${report.summary.passed} warn=${report.summary.warned} fail=${report.summary.failed} skip=${report.summary.skipped} highest=${report.summary.highestSeverity}`
  );
  lines.push('');

  for (const result of report.results) {
    lines.push(`[${result.status.toUpperCase()}] ${result.id} (${result.severity}) - ${result.title}`);

    for (const message of result.messages) {
      lines.push(`  - ${message.code}: ${message.message}`);
    }

    if (result.error) {
      lines.push(`  - error: ${result.error.name}: ${result.error.message}`);
    }
  }

  return lines.join('\n');
}
