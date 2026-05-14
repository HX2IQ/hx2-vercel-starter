# Router v2 Semantic Scoring

## Goal
Upgrade HX2 routing so each query gets meaningful node scores instead of qa1 baseline fallback.

## Files to touch
- app/api/hx2/_lib/capability-planner.ts
- app/api/hx2/_lib/node-router.ts
- app/api/hx2/chat-master/route.ts
- tools/smoke-hx2-capability-planner.ps1
- tools/smoke-hx2-chat-master.ps1

## Required behavior
- Health queries score AH3 highest
- Strategy/advisory queries show O2 display node
- Coding queries show DEV2 display node
- Research queries use source-router and Research display node
- Business queries show Business Intelligence
- Image queries show Design Intelligence
- QA1 remains background validation, not user-facing primary intelligence

## Smoke tests
- AH3 query => ah3
- Coding query => coding/dev2
- Research query => research
- Business query => business
- Image query => image/design
- Roadmap/advisory query => conversation/o2

## Rollback
Restore prior capability-planner and node-router files.
