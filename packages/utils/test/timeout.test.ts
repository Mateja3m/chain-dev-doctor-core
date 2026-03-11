import { describe, expect, it } from 'vitest';

import { withTimeout } from '../src/index.js';

describe('withTimeout', () => {
  it('resolves before timeout', async () => {
    const value = await withTimeout(Promise.resolve('ok'), 100);
    expect(value).toBe('ok');
  });

  it('rejects on timeout', async () => {
    await expect(withTimeout(new Promise(() => {}), 5)).rejects.toThrow('timed out');
  });
});
