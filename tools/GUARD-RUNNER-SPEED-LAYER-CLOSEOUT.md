# HX2 Phase 2.18 — Guard Runner Speed Layer Closeout

## Status

Phase 2.18 Guard Runner Speed Layer is complete and repo-locked.

## Purpose

Reduce HX2 quick verify runtime without weakening safety gates.

The approved approach was not to skip guards, but to reduce repeated PowerShell process startup overhead by running safe static guards in-process while keeping high-risk guards isolated.

## Final Result

- Quick verify guard count: 42
- Runner mode split: 37 in-process / 5 isolated
- Latest quick verify runtime observed: approximately 7.9–8.0 seconds
- Previous common runtime range before speed layer: approximately 16–17 seconds
- Approximate improvement: about 50%
- TypeScript guard remains isolated
- Orchestrator bundle remains isolated
- Process-sensitive guards remain isolated
- Strict retrieval quality bundle remains active
- Benchmark remains passing

## Key Safety Rules Preserved

The runner keeps guards isolated when unsafe patterns are detected, including:

- exit
- global variables
- directory changes
- child PowerShell processes
- npm / npx / tsc / build commands
- git commands

This keeps the speed upgrade conservative and avoids hiding failures behind shared process state.

## Retrieval Smoke Hardening Added During Phase 2.18

During speed work, live retrieval smoke exposed brittle current-news behavior. The smoke test was upgraded to:

1. Try the primary query first.
2. Retry with stricter fallback queries when relevance fails.
3. Still fail if both primary and fallback fail.
4. Tighten XLM/DTCC matching so it requires asset intent plus context intent.

This avoids false failures from transient live search drift while still blocking unrelated results.

## Important Commits

- ea94d6b Add quick verify guard runner speed layer
- 28734be Add quick verify runner mode summary
- 358c65e Add retrieval smoke fallback relevance retry
- 1b7b725 Fix quick verify runner mode propagation
- 7f18c90 Tighten XLM DTCC retrieval smoke intent matching

## Final Verification Evidence

Expected final evidence:

- Quick verify: GREEN
- Guards passed: 42
- Runner mode summary: 37 in-process / 5 isolated
- Strict retrieval trust: 7/7 GREEN
- WatchlistRows: 0
- UnknownRows: 0
- Benchmark: 9.88 average, 8/8 passing
- Working tree: clean

## Closeout Decision

Phase 2.18 is complete.

Next recommended phase:

Phase 2.19 — Retail MVP Execution Acceleration / next highest-value build layer.
