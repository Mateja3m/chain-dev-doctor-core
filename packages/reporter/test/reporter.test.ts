import { describe, expect, it } from 'vitest';

import type { PipelineReport } from '@idoa/dev-doctor-types';

import { createJsonReport, createTerminalReport } from '../src/index.js';

const report: PipelineReport = {
  startedAt: '2026-01-01T00:00:00.000Z',
  finishedAt: '2026-01-01T00:00:02.000Z',
  durationMs: 2000,
  summary: {
    total: 1,
    passed: 1,
    warned: 0,
    failed: 0,
    skipped: 0,
    highestSeverity: 'info'
  },
  results: [
    {
      id: 'node-version',
      title: 'Node version',
      status: 'pass',
      severity: 'info',
      durationMs: 10,
      messages: [{ code: 'NODE_OK', message: 'Node.js is supported' }]
    }
  ]
};

describe('reporter', () => {
  it('serializes JSON output', () => {
    const output = createJsonReport(report);
    expect(JSON.parse(output)).toEqual(report);
  });

  it('renders terminal output', () => {
    const output = createTerminalReport(report);
    expect(output).toContain('Chain Dev Doctor Report');
    expect(output).toContain('[PASS] node-version');
  });
});
