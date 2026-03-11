export type Severity = 'info' | 'warning' | 'error' | 'critical';

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'skip';

export interface CheckMessage {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  severity: Severity;
  durationMs: number;
  messages: CheckMessage[];
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
  };
}

export interface DiagnosticContext {
  chainId?: string;
  env?: Record<string, string | undefined>;
  cwd?: string;
  [key: string]: unknown;
}

export interface DiagnosticCheck<TContext extends DiagnosticContext = DiagnosticContext> {
  id: string;
  title: string;
  defaultSeverity: Severity;
  timeoutMs?: number;
  run: (context: TContext) => Promise<Omit<CheckResult, 'id' | 'title' | 'severity' | 'durationMs'>>;
}

export interface PipelineConfig {
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
}

export interface PipelineSummary {
  total: number;
  passed: number;
  warned: number;
  failed: number;
  skipped: number;
  highestSeverity: Severity;
}

export interface PipelineReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: PipelineSummary;
  results: CheckResult[];
}

export interface ChainAdapter<TContext extends DiagnosticContext = DiagnosticContext> {
  readonly chainName: string;
  createContext: () => Promise<TContext>;
  checks: DiagnosticCheck<TContext>[];
}
