import { runDiagnosticPipeline } from '@idoa/dev-doctor-core';
import { createJsonReport, createTerminalReport } from '@idoa/dev-doctor-reporter';
import type { ChainAdapter, PipelineReport } from '@idoa/dev-doctor-types';

export interface RunAdapterCliOptions {
  format?: 'json' | 'terminal';
}

export async function runAdapterCli(
  adapter: ChainAdapter,
  options: RunAdapterCliOptions = {}
): Promise<{ report: PipelineReport; output: string }> {
  const context = await adapter.createContext();

  const report = await runDiagnosticPipeline({
    checks: adapter.checks,
    context
  });

  const output = options.format === 'json' ? createJsonReport(report) : createTerminalReport(report);

  return {
    report,
    output
  };
}
