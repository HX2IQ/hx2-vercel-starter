# HX2 Intelligence Layer Audit

Generated: 06/04/2026 18:58:02

## Purpose

This audit estimates how much of HX2's intelligence layer is actually implemented versus scaffolding/contracts.

## Summary Counts

- LIKELY_REAL_IMPLEMENTATION: 37
- NEEDS_MANUAL_REVIEW: 25


## Classification Meaning

- LIKELY_REAL_IMPLEMENTATION = file appears to use real execution, persistence, APIs, Redis, Prisma, or async runtime behavior.
- MIXED_REAL_AND_SCAFFOLD = file has some real signals but also placeholder/static/contract patterns.
- LIKELY_SCAFFOLDING = file mostly returns static contracts, statuses, mock data, or read-only JSON.
- NEEDS_MANUAL_REVIEW = not enough signal either way.

## Files Classified

- [LIKELY_REAL_IMPLEMENTATION] app\api\ap2\execute\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\ap2\queue\debug\route.ts | RealScore=8 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\ap2\redis\debug\route.ts | RealScore=7 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\ap2\status\route.ts | RealScore=6 | ScaffoldScore=0
- [LIKELY_REAL_IMPLEMENTATION] app\api\ap2\task\enqueue\route.ts | RealScore=6 | ScaffoldScore=0
- [LIKELY_REAL_IMPLEMENTATION] app\api\ap2\task\status\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\attach\route.ts | RealScore=7 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\chat\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\health\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\memory\repair\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\memory\status\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\memory\tail\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\brain\run\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\router\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\search\resources\search\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\search\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\source-router\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\youtube\local-first\route.ts | RealScore=8 | ScaffoldScore=2
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\youtube\resources\route.ts | RealScore=6 | ScaffoldScore=2
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\youtube\resources\search\route.ts | RealScore=6 | ScaffoldScore=2
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\youtube\resources\upgrade\route.ts | RealScore=7 | ScaffoldScore=2
- [LIKELY_REAL_IMPLEMENTATION] app\api\hx2\youtube\search\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\action-history\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\action\route.ts | RealScore=7 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\active-nodes\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\chat-master-health\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\environment-status\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\memory-status\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\node-activate\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\node-drafts\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\node-execute\route.ts | RealScore=7 | ScaffoldScore=2
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\node-execution-history\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\o2-action-map\route.ts | RealScore=5 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\o2-autopilot-policy\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\o2-chain-reset\route.ts | RealScore=6 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\o2-chain\route.ts | RealScore=7 | ScaffoldScore=1
- [LIKELY_REAL_IMPLEMENTATION] app\api\owner\remote-result\route.ts | RealScore=6 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\ap2\authcheck\route.ts | RealScore=3 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\ap2\diagnostics\route.ts | RealScore=1 | ScaffoldScore=2
- [NEEDS_MANUAL_REVIEW] app\api\ap2\logs\tail\route.ts | RealScore=3 | ScaffoldScore=0
- [NEEDS_MANUAL_REVIEW] app\api\ap2\redis\ping\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\ap2\task\result\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\brain\status\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\hx2\capability-planner\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\hx2\chat-master\route.ts | RealScore=3 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\hx2\youtube\transcript\route.ts | RealScore=3 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\ap2-queue\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\autopsies\route.ts | RealScore=1 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\baseline-detail\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\baselines\route.ts | RealScore=1 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\benchmark\latest\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\guard-status\route.ts | RealScore=1 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\health\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\o2-actions\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\o2-autopilot-decision\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\o2-autopilot-dry-run\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\o2-next\route.ts | RealScore=4 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\o2-status\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\postflights\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\releases\route.ts | RealScore=1 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] app\api\owner\summary\route.ts | RealScore=2 | ScaffoldScore=1
- [NEEDS_MANUAL_REVIEW] prisma\schema.prisma | RealScore=2 | ScaffoldScore=0


## Likely Real Implementation Files

- app\api\ap2\execute\route.ts
  - Real signals: POST, await , enqueue, execute, run
- app\api\ap2\queue\debug\route.ts
  - Real signals: redis, upstash, fetch\(, process\.env, POST, await , run, search
- app\api\ap2\redis\debug\route.ts
  - Real signals: redis, upstash, fetch\(, process\.env, POST, await , run
- app\api\ap2\status\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run, search
- app\api\ap2\task\enqueue\route.ts
  - Real signals: fetch\(, process\.env, POST, await , enqueue, run
- app\api\ap2\task\status\route.ts
  - Real signals: fetch\(, process\.env, await , run, search
- app\api\brain\attach\route.ts
  - Real signals: fetch\(, process\.env, POST, await , select, enqueue, run
- app\api\brain\chat\route.ts
  - Real signals: fetch\(, OpenAI, process\.env, POST, await , run
- app\api\brain\health\route.ts
  - Real signals: fetch\(, process\.env, await , run, memory
- app\api\brain\memory\repair\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run, memory
- app\api\brain\memory\status\route.ts
  - Real signals: fetch\(, process\.env, await , run, memory
- app\api\brain\memory\tail\route.ts
  - Real signals: fetch\(, process\.env, await , run, memory, search
- app\api\brain\run\route.ts
  - Real signals: fetch\(, OpenAI, process\.env, POST, await , run
- app\api\hx2\router\route.ts
  - Real signals: fetch\(, POST, await , execute, run
- app\api\hx2\search\resources\search\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , run
- app\api\hx2\search\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run, search
- app\api\hx2\source-router\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run, search
- app\api\hx2\youtube\local-first\route.ts
  - Real signals: redis, upstash, fetch\(, process\.env, POST, await , run, search
- app\api\hx2\youtube\resources\route.ts
  - Real signals: redis, upstash, process\.env, await , run, search
- app\api\hx2\youtube\resources\search\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , run
- app\api\hx2\youtube\resources\upgrade\route.ts
  - Real signals: redis, upstash, fetch\(, process\.env, POST, await , run
- app\api\hx2\youtube\search\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run, search
- app\api\owner\action-history\route.ts
  - Real signals: redis, upstash, process\.env, await , run
- app\api\owner\action\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , enqueue, run
- app\api\owner\active-nodes\route.ts
  - Real signals: redis, upstash, process\.env, await , run
- app\api\owner\chat-master-health\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run
- app\api\owner\environment-status\route.ts
  - Real signals: redis, upstash, OpenAI, process\.env, run
- app\api\owner\memory-status\route.ts
  - Real signals: fetch\(, process\.env, await , run, memory
- app\api\owner\node-activate\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , run
- app\api\owner\node-drafts\route.ts
  - Real signals: redis, upstash, process\.env, await , run
- app\api\owner\node-execute\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , execute, run
- app\api\owner\node-execution-history\route.ts
  - Real signals: redis, upstash, process\.env, await , run
- app\api\owner\o2-action-map\route.ts
  - Real signals: fetch\(, process\.env, POST, await , run
- app\api\owner\o2-autopilot-policy\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , run
- app\api\owner\o2-chain-reset\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , run
- app\api\owner\o2-chain\route.ts
  - Real signals: redis, upstash, fetch\(, process\.env, POST, await , run
- app\api\owner\remote-result\route.ts
  - Real signals: redis, upstash, process\.env, POST, await , run


## Mixed Files



## Likely Scaffolding Files



## Next Interpretation

After this audit, the most important number is the ratio of:

LIKELY_REAL_IMPLEMENTATION + MIXED_REAL_AND_SCAFFOLD

versus

LIKELY_SCAFFOLDING.

That ratio will tell us how much actual intelligence/runtime capability exists.

