export interface RetryOptions {
  retries: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= options.retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const canRetry =
        attempt < options.retries &&
        (options.shouldRetry ? options.shouldRetry(error, attempt + 1) : true);

      if (!canRetry) {
        break;
      }

      const waitMs = Math.min(options.retryDelayMs * 2 ** attempt, options.maxRetryDelayMs);
      await sleep(waitMs);
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry operation failed');
}

export async function withTimeout<T>(operation: Promise<T>, timeoutMs: number, label = 'operation') {
  if (timeoutMs <= 0) {
    throw new Error('timeoutMs must be greater than 0');
  }

  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown error');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
