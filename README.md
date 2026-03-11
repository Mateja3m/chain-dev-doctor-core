# Chain dev doctor core

Chain dev doctor core is a TypeScript-first npm workspace that provides reusable, chain-agnostic foundations for developer diagnostics, onboarding checks, and reliability tooling.

This repository is intended to be consumed by chain-specific tools such as:
- `aleo-dev-doctor`
- `flow-dev-doctor`
- `ckb-dev-doctor`

## Purpose

This workspace centralizes shared behavior so chain-specific projects can focus on protocol-specific checks, while using a consistent engine for execution, retries, timeouts, severity modeling, and reporting.

## Architecture Overview

The repo is split into small packages with stable APIs:

- `@idoa/dev-doctor-types`: shared contracts and result types
- `@idoa/dev-doctor-utils`: generic runtime helpers (retry, timeout, guards)
- `@idoa/dev-doctor-core`: diagnostics pipeline, check registry, aggregation, config validation
- `@idoa/dev-doctor-reporter`: JSON and human-readable terminal reporting
- `@idoa/dev-doctor-cli-kit`: minimal CLI integration helpers

Design principles:
- chain-agnostic by default
- explicit public APIs
- minimal hidden behavior
- strict typing and validation

## Workspace Layout

```txt
.
├── packages/
│   ├── core/
│   ├── cli-kit/
│   ├── reporter/
│   ├── types/
│   └── utils/
├── eslint.config.js
├── vitest.config.ts
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Package Summaries

### `@idoa/dev-doctor-types`
- standardized check/result/report types
- adapter and config contracts

### `@idoa/dev-doctor-utils`
- retry/backoff utilities
- timeout wrappers
- small type-safe helpers

### `@idoa/dev-doctor-core`
- check registration and execution
- pipeline orchestration
- result aggregation
- zod config validation

### `@idoa/dev-doctor-reporter`
- structured JSON report generation
- terminal-friendly report rendering

### `@idoa/dev-doctor-cli-kit`
- simple CLI runner for wiring adapters to the core engine

## Local Development

Requirements:
- Node.js `>=20`
- npm `>=10`

Install:

```bash
npm install
```

Build all packages:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

Lint:

```bash
npm run lint
```

Typecheck:

```bash
npm run typecheck
```

## Consumption from Chain-Specific Repos

In a chain-specific repository:

1. Install needed packages.
2. Implement `ChainAdapter` and chain-specific checks using `@idoa/dev-doctor-types`.
3. Use `runDiagnosticPipeline` from `@idoa/dev-doctor-core`.
4. Render output with `@idoa/dev-doctor-reporter`.

Example sketch:

```ts
import { runDiagnosticPipeline } from '@idoa/dev-doctor-core';
import { createTerminalReport } from '@idoa/dev-doctor-reporter';

const report = await runDiagnosticPipeline({
  checks: myChainChecks,
  context: myContext,
  pipelineConfig: { timeoutMs: 5000 }
});

console.log(createTerminalReport(report));
```

## Security and Maintenance

- Strict TypeScript and explicit data contracts
- Safe parsing through zod where config/user input enters the system
- No protocol-specific logic in this repo
- Focused unit tests for deterministic core behaviors

See:
- `SECURITY.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `LICENSE`
