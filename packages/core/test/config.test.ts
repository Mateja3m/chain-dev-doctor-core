import { describe, expect, it } from 'vitest';

import { validatePipelineConfig } from '../src/index.js';

describe('validatePipelineConfig', () => {
  it('applies defaults when config is omitted', () => {
    const config = validatePipelineConfig();

    expect(config).toMatchObject({
      timeoutMs: 5000,
      retries: 1,
      retryDelayMs: 100,
      maxRetryDelayMs: 1000
    });
  });

  it('rejects invalid values', () => {
    expect(() => validatePipelineConfig({ timeoutMs: 0 })).toThrow();
  });
});
