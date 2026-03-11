import { describe, expect, it } from 'vitest';

import { retryWithBackoff } from '../src/index.js';

describe('retryWithBackoff', () => {
  it('retries and eventually succeeds', async () => {
    let attempts = 0;

    const value = await retryWithBackoff(
      async () => {
        await Promise.resolve();
        attempts += 1;
        if (attempts < 3) {
          throw new Error('transient failure');
        }

        return 'ok';
      },
      {
        retries: 3,
        retryDelayMs: 1,
        maxRetryDelayMs: 5
      }
    );

    expect(value).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('throws when retries are exhausted', async () => {
    await expect(
      retryWithBackoff(
        async () => {
          await Promise.resolve();
          throw new Error('boom');
        },
        {
          retries: 1,
          retryDelayMs: 1,
          maxRetryDelayMs: 5
        }
      )
    ).rejects.toThrow('boom');
  });
});
