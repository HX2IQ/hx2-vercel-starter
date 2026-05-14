# Context Bridge v2 Patch Plan

## Goal
Upgrade HX2 from session-pattern context to operator-aware strategic context.

## Files to touch
- app/api/hx2/_lib/context-bridge.ts
- app/api/hx2/_lib/owner-context.ts
- app/api/hx2/_lib/master-synth.ts
- tools/smoke-hx2-chat-master.ps1

## Required behavior
- Detect active HX2/OI build context
- Detect Koenig Polish business context
- Detect roadmap/phase questions
- Detect fatigue/build-loop risk
- Feed context notes into synthesis
- Preserve QA1 as background validation only

## Smoke tests
- “What phase are we in?”
- “What is the smartest move for my future?”
- “How should I use Koenig Polish cashflow?”

## Commit
Add context bridge v2
