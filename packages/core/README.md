# @idoa/dev-doctor-core

Core orchestration package for chain-agnostic diagnostic execution.

## Features

- check registration and deduplication
- execution pipeline with timeout + retry
- deterministic result aggregation
- config validation with zod

## Usage

```ts
import { runDiagnosticPipeline } from '@idoa/dev-doctor-core';
```
