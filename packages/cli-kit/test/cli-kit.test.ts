import { describe, expect, it } from 'vitest';

import type { ChainAdapter } from '@idoa/types';

import { runAdapterCli } from '../src/index.js';

describe('runAdapterCli', () => {
  it('runs adapter checks and returns terminal output', async () => {
    const adapter: ChainAdapter = {
      chainName: 'test-chain',
      createContext: async () => {
        await Promise.resolve();
        return {};
      },
      checks: [
        {
          id: 'sample-check',
          title: 'Sample check',
          defaultSeverity: 'info',
          run: async () => {
            await Promise.resolve();
            return {
              status: 'pass',
              messages: [{ code: 'OK', message: 'good' }]
            };
          }
        }
      ]
    };

    const result = await runAdapterCli(adapter);

    expect(result.report.summary.passed).toBe(1);
    expect(result.output).toContain('[PASS] sample-check');
  });
});
