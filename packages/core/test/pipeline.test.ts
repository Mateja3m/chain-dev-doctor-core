import { describe, expect, it } from 'vitest';

import type { DiagnosticCheck } from '@idoa/dev-doctor-types';

import { aggregateResults, runDiagnosticPipeline } from '../src/index.js';

describe('runDiagnosticPipeline', () => {
  it('executes checks and aggregates summary', async () => {
    const checks: DiagnosticCheck[] = [
      {
        id: 'check-pass',
        title: 'Pass check',
        defaultSeverity: 'info',
        run: async () => {
          await Promise.resolve();
          return {
            status: 'pass',
            messages: [{ code: 'OK', message: 'all good' }]
          };
        }
      },
      {
        id: 'check-warn',
        title: 'Warn check',
        defaultSeverity: 'warning',
        run: async () => {
          await Promise.resolve();
          return {
            status: 'warn',
            messages: [{ code: 'WARN', message: 'needs attention' }]
          };
        }
      }
    ];

    const report = await runDiagnosticPipeline({
      checks,
      context: {}
    });

    expect(report.summary.total).toBe(2);
    expect(report.summary.passed).toBe(1);
    expect(report.summary.warned).toBe(1);
    expect(report.summary.highestSeverity).toBe('warning');
  });

  it('captures thrown errors as failed results', async () => {
    const checks: DiagnosticCheck[] = [
      {
        id: 'check-fail',
        title: 'Fail check',
        defaultSeverity: 'error',
        run: async () => {
          await Promise.resolve();
          throw new Error('unexpected issue');
        }
      }
    ];

    const report = await runDiagnosticPipeline({
      checks,
      context: {},
      pipelineConfig: { retries: 0 }
    });

    expect(report.results[0]?.status).toBe('fail');
    expect(report.results[0]?.error?.message).toContain('unexpected issue');
    expect(report.summary.failed).toBe(1);
    expect(report.summary.highestSeverity).toBe('critical');
  });
});

describe('aggregateResults', () => {
  it('computes status counters and highest severity', () => {
    const summary = aggregateResults([
      {
        id: '1',
        title: 'one',
        status: 'pass',
        severity: 'info',
        durationMs: 1,
        messages: []
      },
      {
        id: '2',
        title: 'two',
        status: 'warn',
        severity: 'warning',
        durationMs: 1,
        messages: []
      },
      {
        id: '3',
        title: 'three',
        status: 'fail',
        severity: 'error',
        durationMs: 1,
        messages: []
      }
    ]);

    expect(summary).toMatchObject({
      total: 3,
      passed: 1,
      warned: 1,
      failed: 1,
      highestSeverity: 'error'
    });
  });
});
