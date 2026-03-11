import { runDiagnosticPipeline } from '@idoa/core';
import { createJsonReport, createTerminalReport } from '@idoa/reporter';
import type { ChainAdapter, PipelineReport } from '@idoa/types';

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
