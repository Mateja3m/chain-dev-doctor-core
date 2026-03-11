import { z } from 'zod';

import { retryWithBackoff, toError, withTimeout } from '@idoa/utils';
import type {
  CheckResult,
  DiagnosticCheck,
  DiagnosticContext,
  PipelineConfig,
  PipelineReport,
  PipelineSummary,
  Severity
} from '@idoa/types';

const pipelineConfigSchema = z.object({
  timeoutMs: z.number().int().positive().default(5000),
  retries: z.number().int().min(0).max(10).default(1),
  retryDelayMs: z.number().int().min(1).default(100),
  maxRetryDelayMs: z.number().int().min(1).default(1000)
});

export interface RunPipelineInput<TContext extends DiagnosticContext = DiagnosticContext> {
  checks: DiagnosticCheck<TContext>[];
  context: TContext;
  pipelineConfig?: Partial<PipelineConfig>;
}

export class CheckRegistry<TContext extends DiagnosticContext = DiagnosticContext> {
  private readonly map = new Map<string, DiagnosticCheck<TContext>>();

  register(check: DiagnosticCheck<TContext>): void {
    if (this.map.has(check.id)) {
      throw new Error(`Duplicate check id: ${check.id}`);
    }

    this.map.set(check.id, check);
  }

  list(): DiagnosticCheck<TContext>[] {
    return [...this.map.values()];
  }
}

export function validatePipelineConfig(input?: Partial<PipelineConfig>): PipelineConfig {
  return pipelineConfigSchema.parse(input ?? {});
}

export async function runDiagnosticPipeline<TContext extends DiagnosticContext>(
  input: RunPipelineInput<TContext>
): Promise<PipelineReport> {
  const startedAt = new Date();
  const config = validatePipelineConfig(input.pipelineConfig);
  const results: CheckResult[] = [];

  for (const check of input.checks) {
    const checkStarted = Date.now();

    try {
      const result = await retryWithBackoff(
        async () => {
          const timeoutMs = check.timeoutMs ?? config.timeoutMs;

          return withTimeout(check.run(input.context), timeoutMs, `check ${check.id}`);
        },
        {
          retries: config.retries,
          retryDelayMs: config.retryDelayMs,
          maxRetryDelayMs: config.maxRetryDelayMs
        }
      );

      results.push({
        ...result,
        id: check.id,
        title: check.title,
        severity: check.defaultSeverity,
        durationMs: Date.now() - checkStarted
      });
    } catch (error) {
      const safeError = toError(error);

      results.push({
        id: check.id,
        title: check.title,
        status: 'fail',
        severity: 'critical',
        durationMs: Date.now() - checkStarted,
        messages: [
          {
            code: 'CHECK_EXECUTION_ERROR',
            message: safeError.message
          }
        ],
        error: {
          name: safeError.name,
          message: safeError.message
        }
      });
    }
  }

  const finishedAt = new Date();

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    summary: aggregateResults(results),
    results
  };
}

export function aggregateResults(results: CheckResult[]): PipelineSummary {
  const summary: PipelineSummary = {
    total: results.length,
    passed: 0,
    warned: 0,
    failed: 0,
    skipped: 0,
    highestSeverity: 'info'
  };

  for (const result of results) {
    switch (result.status) {
      case 'pass':
        summary.passed += 1;
        break;
      case 'warn':
        summary.warned += 1;
        break;
      case 'fail':
        summary.failed += 1;
        break;
      case 'skip':
        summary.skipped += 1;
        break;
      default:
        break;
    }

    if (severityRank(result.severity) > severityRank(summary.highestSeverity)) {
      summary.highestSeverity = result.severity;
    }
  }

  return summary;
}

function severityRank(severity: Severity): number {
  switch (severity) {
    case 'info':
      return 0;
    case 'warning':
      return 1;
    case 'error':
      return 2;
    case 'critical':
      return 3;
    default:
      return 0;
  }
}
