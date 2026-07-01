# DEV2 Team Build Accelerator Charter

Status: active
Mode: team-style sprint execution
Purpose: increase HX2 build throughput without reducing safety gates.

## Why This Exists

HX2 has matured beyond independent-programmer execution.

The repo now has:

- DEV2-XE execution governance
- strict retrieval trust
- quick verify
- benchmark guard
- source evidence guards
- route and UI guard layers
- sprint-next tooling
- owner/status surfaces

The next acceleration step is not to skip verification. The next acceleration step is to organize work like a small engineering team.

## Team Lanes

### 1. Architect Lane

Owns:

- system boundaries
- dependency map
- hot-file risk
- route/module design
- acceptance criteria

Default verify tier:

- full
- strict for retrieval/source work
- build for route/runtime work

### 2. Planner Lane

Owns:

- sprint manifest
- task decomposition
- sequencing
- file ownership
- risk class
- rollback notes

Default verify tier:

- fast for docs/tooling
- full for code-touching plans

### 3. Implementer Lane

Owns:

- actual patching
- structured mutation mode
- no fragile regex on TS/TSX/routes unless explicitly safe
- whole-file rewrites for hot files when needed

Default verify tier:

- full
- build for app/runtime files

### 4. QA Lane

Owns:

- guard coverage
- smoke checks
- benchmark
- strict retrieval trust
- failure triage

Default verify tier:

- strict
- build when runtime affected

### 5. Release Manager Lane

Owns:

- git status
- diff review
- commit grouping
- push decision
- deploy readiness
- no auto-release without explicit approval

Default verify tier:

- full
- strict
- post-deploy when applicable

### 6. Docs / Closeout Lane

Owns:

- closeout snapshots
- runbook updates
- phase summaries
- handoff notes

Default verify tier:

- fast unless code paths changed

## Risk Classes

### Low Risk

Examples:

- docs
- closeout files
- static guards
- package script additions for existing scripts

Allowed verify:

- fast
- full when being committed

### Medium Risk

Examples:

- verify bundles
- guard wiring
- owner/status UI
- sprint tooling

Allowed verify:

- full
- strict if retrieval/source-related

### High Risk

Examples:

- app/api routes
- auth
- billing
- retrieval runtime
- chat-master
- orchestrator
- DB/schema
- production promotion gates

Required verify:

- full quick verify
- strict retrieval when retrieval/source-related
- TypeScript
- benchmark
- build when route/runtime affected

## Hot-File Policy

Hot files require extra coordination:

- app/api/hx2/chat-master/route.ts
- app/api/hx2/_lib/unified-retrieval.ts
- app/api/hx2/_lib/master-retrieval-synthesis.ts
- tools/hx2-quick-verify.ps1
- tools/retrieval-quality/hx2-retrieval-quality-verify-bundle.ps1
- package.json

Rules:

1. One owner lane per hot file.
2. If multiple lanes touch the same file, it must be listed in coordination.hot_files.
3. Hot-file changes require full verify before commit.
4. Retrieval hot-file changes require strict retrieval verify.
5. Route/runtime hot-file changes require TypeScript and benchmark.

## Sprint Manifest Requirement

Team-mode sprints should declare:

- objective
- lanes
- owner role
- risk class
- verify tier
- files owned
- dependencies
- release decision
- rollback notes

## Throughput Rule

The goal is larger safe sprint packages, not reckless speed.

Allowed:

- bundle related guard + script + docs changes
- bundle inspection + guard + closeout when low risk
- parallelize planning and QA inside the manifest

Not allowed:

- skipping final strict/full verify before commit
- mixing unrelated high-risk route changes
- modifying hot files without ownership
- auto-deploying without explicit approval

## Closeout Decision

DEV2 team mode is active when:

- team sprint manifest guard passes
- quick verify passes
- benchmark passes
- working tree is clean after commit

