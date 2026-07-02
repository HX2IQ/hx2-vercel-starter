# HX2 Phase 2.19B — Retail MVP Lane Radar

## Purpose

Choose the next Retail MVP acceleration lane using repo evidence instead of guessing.

## Lane Summary

| Lane | Signal | File Count | Patch Risk | Value |
|---|---:|---:|---|---|
| Retail demo flow readiness | GREEN | 40 | low-medium | Shows a buyer/user the product clearly. |
| Owner console readiness | GREEN | 40 | low-medium | Gives you control and visibility over the system. |
| Pricing / checkout / billing readiness | GREEN | 8 | high | Connects MVP to revenue, but can affect money/account flows. |
| Auth / account readiness | GREEN | 25 | high | Required for real users, but fragile and security-sensitive. |
| Chat-master user-facing reliability | GREEN | 40 | medium-high | Core product quality and answer reliability. |
| Onboarding / first-run experience | RED | 0 | low | Improves conversion and reduces confusion. |
| MVP release gate / production readiness panel | GREEN | 40 | low-medium | Shows what is ready, blocked, or unsafe before paid retail launch. |

## File Evidence By Lane

### Retail demo flow readiness

- Signal: GREEN
- File count: 40
- Patch risk: low-medium
- Value: Shows a buyer/user the product clearly.

- `app\api\brain\chat\route.ts`
- `app\api\chat\poll\route.ts`
- `app\api\chat\send\route.ts`
- `app\api\chat\send\route.ts.bak_1770434884`
- `app\api\chat\send\route.ts.bak_1770435713`
- `app\api\chat\send\route.ts.bak_1770436244`
- `app\api\chat\send\route.ts.bak_1770436686`
- `app\api\chat\send\route.ts.bak_1770437033`
- `app\api\chat\send\route.ts.bak_1770437552`
- `app\api\chat\send\route.ts.bak_20260211-095310`
- `app\api\chat\send\route.ts.bak_20260211-220932`
- `app\api\chat\send\route.ts.bak_fix_fetch_20260211-095547`
- `app\api\chat\send\route.ts.bak.1770943879369`
- `app\api\chat\send\route.ts.bak.1771037335`
- `app\api\chat\send\route.ts.bak.1771120666`
- `app\api\chat\send\route.ts.bak.1771120979`
- `app\api\chat\send\route.ts.bak.1771121140`
- `app\api\chat\send\route.ts.bak.1771121352`
- `app\api\chat\send\route.ts.bak.1771121619`
- `app\api\chat\send\route.ts.bak.1771121731`
- `app\api\chat\send\route.ts.bak.1771122875`
- `app\api\chat\send\route.ts.bak.1771124062`
- `app\api\chat\send\route.ts.bak.1771252403`
- `app\api\chat\send\route.ts.bak.1771267946`
- `app\api\chat\send\route.ts.bak.1771269331`
- `app\api\chat\send\route.ts.bak.1771293586`
- `app\api\chat\send\route.ts.bak.20260128_090553`
- `app\api\chat\send\route.ts.bak.20260128_095353`
- `app\api\chat\send\route.ts.bak.20260128_102429`
- `app\api\chat\send\route.ts.bak.authfix.1773164879`
- `app\api\chat\send\route.ts.bak.brain-tighten.1773238206`
- `app\api\chat\send\route.ts.bak.brief-format-1773360323`
- `app\api\chat\send\route.ts.bak.catalyst-labels.1773260411`
- `app\api\chat\send\route.ts.bak.clean-weakcontext.1773242468`
- `app\api\chat\send\route.ts.bak.cluster-prefilter.1773259544`
- `app\api\chat\send\route.ts.bak.conflict-detect.1773253665`
- `app\api\chat\send\route.ts.bak.dedupe-guard.1773182233`
- `app\api\chat\send\route.ts.bak.diversity-caps.1773271879`
- `app\api\chat\send\route.ts.bak.elseif-fix.1773183707`
- `app\api\chat\send\route.ts.bak.fix-nodeinstruction.1773183447`

### Owner console readiness

- Signal: GREEN
- File count: 40
- Patch risk: low-medium
- Value: Gives you control and visibility over the system.

- `app\ap2\handlers\safe\registry.status.js`
- `app\api\ap2\status\route.ts`
- `app\api\ap2\task\status\route.ts`
- `app\api\ap2\task\status\route.ts.bak.1771470374`
- `app\api\ap2\task\status\route.ts.bak.1771470840`
- `app\api\ap2\task\status\route.ts.bak.1772245350`
- `app\api\ap2\task\status\route.ts.bak.1772249498`
- `app\api\ap2\task\status\route.ts.bak.1772249735`
- `app\api\ap2\task\status\route.ts.bak.1772293555`
- `app\api\ap2\task\status\route.ts.bak.1772294120`
- `app\api\ap2\task\status\route.ts.bak.1772296599`
- `app\api\ap2\task\status\route.ts.bak.1772678143`
- `app\api\ap2\task\status\route.ts.bak.20260220_143501`
- `app\api\ap2\task\status\route.ts.bak.20260220_154432`
- `app\api\ap2\task\status\route.ts.bak.20260220_155718`
- `app\api\ap2\task\status\route.ts.bak.20260220_173810`
- `app\api\ap2\task\status\route.ts.bak.20260304_155514`
- `app\api\ap2\task\status\route.ts.bak.20260304_161915`
- `app\api\ap2\task\status\route.ts.bak.20260304_163622`
- `app\api\ap2\task\status\route.ts.bak.20260304_165818`
- `app\api\ap2\task\status\route.ts.bak.20260304_170104`
- `app\api\brain\memory\status\route.ts`
- `app\api\brain\status\route.ts`
- `app\api\chat\status\route.ts`
- `app\api\console\chat\route.ts`
- `app\api\console\execute\route.ts`
- `app\api\console\nodes\get\route.ts`
- `app\api\hx2\_lib\kgx-owner-approval-gate.ts`
- `app\api\hx2\_lib\owner-context.ts`
- `app\api\hx2\_lib\phase3b-orchestration-status.ts`
- `app\api\hx2\chat-master-status\route.ts`
- `app\api\hx2\deployment-status\route.ts`
- `app\api\hx2\orchestrator-status\route.ts`
- `app\api\hx2\owner-status\route.ts`
- `app\api\hx2\phase10-master-status\route.ts`
- `app\api\hx2\phase3b-orchestration-status\route.ts`
- `app\api\hx2\phase5-dashboard-contract\route.ts`
- `app\api\hx2\phase5-master-status\route.ts`
- `app\api\hx2\phase5-owner-console-dashboard\route.ts`
- `app\api\hx2\phase5-ui-status\route.ts`

### Pricing / checkout / billing readiness

- Signal: GREEN
- File count: 8
- Patch risk: high
- Value: Connects MVP to revenue, but can affect money/account flows.

- `app\healthoi\page.tsx.bak_pricing`
- `app\oi\pricing\page.tsx`
- `app\retail\pricing\page.tsx`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\build.log`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\snapshots\benchmark-before.txt`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\snapshots\build-before.txt`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\snapshots\router-before.txt`
- `tools\hx2-auth-billing-probe.ps1`

### Auth / account readiness

- Signal: GREEN
- File count: 25
- Patch risk: high
- Value: Required for real users, but fragile and security-sensitive.

- `app\api\_lib\auth.ts`
- `app\api\ap2\authcheck\route.ts`
- `app\api\chat\send\route.ts.bak.authfix.1773164879`
- `app\api\hx2\_lib\kgx-cost-guard-authority.ts`
- `app\api\hx2\_lib\kgx-runtime-health-authority.ts`
- `app\api\hx2\_lib\kgx-runtime-telemetry-authority.ts`
- `app\api\hx2\chat\route.ts.bak.session-memory.1775271143`
- `app\api\hx2\kgx-cost-guard-authority-preview\route.ts`
- `app\api\hx2\kgx-runtime-health-authority-preview\route.ts`
- `app\api\hx2\kgx-runtime-telemetry-authority-preview\route.ts`
- `app\lib\auth.ts`
- `lib\auth.ts`
- `lib\auth\owner.ts`
- `tools\canonical\owner-actions-page.canonical.tsx.bak.fix-brain-connectivity-auth.1774916824`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\build.log`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\snapshots\benchmark-before.txt`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\snapshots\build-before.txt`
- `tools\dev2\runs\20260623-053028-auth-billing-accounts-functional-probe\snapshots\router-before.txt`
- `tools\dev2\runs\20260624-025208-main-chat-user-flow-proof\build.log`
- `tools\dev2\runs\20260624-025208-main-chat-user-flow-proof\snapshots\benchmark-before.txt`
- `tools\dev2\runs\20260624-025208-main-chat-user-flow-proof\snapshots\build-before.txt`
- `tools\dev2\runs\20260624-025208-main-chat-user-flow-proof\snapshots\router-before.txt`
- `tools\hx2-auth-billing-probe.ps1`
- `tools\hx2-main-chat-user-flow-smoke.ps1`
- `tools\retrieval-quality\hx2-authoritative-definition-source-preference-guard.ps1`

### Chat-master user-facing reliability

- Signal: GREEN
- File count: 40
- Patch risk: medium-high
- Value: Core product quality and answer reliability.

- `app\api\chat\send\route.ts.bak.source-cap.1773193122`
- `app\api\chat\send\route.ts.bak.source-ladder.1773245738`
- `app\api\chat\send\route.ts.bak.source-memory.1773279327`
- `app\api\chat\send\route.ts.bak.source-role-render.1773278850`
- `app\api\hx2\_lib\chat-master-router.ts`
- `app\api\hx2\_lib\kgx-resource-allocation-intelligence.ts`
- `app\api\hx2\_lib\kgx-resource-availability-intelligence.ts`
- `app\api\hx2\_lib\kgx-resource-requirement-intelligence.ts`
- `app\api\hx2\_lib\master-benchmark-quality-lift.ts`
- `app\api\hx2\_lib\master-retrieval-synthesis.ts`
- `app\api\hx2\_lib\resource-scoring.ts`
- `app\api\hx2\_lib\source-score.ts`
- `app\api\hx2\_lib\unified-retrieval.ts`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.content-distillation.1781355933`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.content-hygiene.1781362313`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.definition-news-source-ranking.1781375106`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.exclude-low-quality-news-sources.1781379502`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.expand-rss-fresh-queries.1781381396`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.fresh-query-expansion.1781380298`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.live-web-bridge.1781313595`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.normalize-the-xrp-ledger.1781312798`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.page-content-extraction.1781314210`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.preserve-published-metadata.1781390967`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.real-rss-wire.1781289094`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.relevance-gated-rss.1781296110`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.restore-known-query-map.1781311534`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.retrieval-enrichment-resilience.1781374085`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.rss-answer-polish.1781383947`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.rss-page-enrichment.1781360423`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.rss-page-enrichment.1781361135`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.rss-v1.1781286220`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.skip-aggregator-enrichment.1781378265`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.source-dedupe.1781382230`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.source-dedupe.1781383040`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.wikipedia-query-normalization.1781284652`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.wikipedia-v1.1781281481`
- `app\api\hx2\chat-master-diagnostics\route.ts`
- `app\api\hx2\chat-master-execution-map\route.ts`
- `app\api\hx2\chat-master-intents\route.ts`
- `app\api\hx2\chat-master-keywords\route.ts`

### Onboarding / first-run experience

- Signal: RED
- File count: 0
- Patch risk: low
- Value: Improves conversion and reduces confusion.

- No matching files found.

### MVP release gate / production readiness panel

- Signal: GREEN
- File count: 40
- Patch risk: low-medium
- Value: Shows what is ready, blocked, or unsafe before paid retail launch.

- `app\api\brain\health\route.ts`
- `app\api\chat\send\route.ts.bak.remove-gateway.1773163875`
- `app\api\factcheck\verify\route.ts`
- `app\api\health\route.ts`
- `app\api\health\score\route.ts`
- `app\api\hx2\_lib\capability-planner.ts.bak_healthoi_hint_fix`
- `app\api\hx2\_lib\cheap-local.ts.bak_health_upgrade`
- `app\api\hx2\_lib\execution-lineage-integrity-gate.ts`
- `app\api\hx2\_lib\general-llm.ts.bak_healthoi_branding`
- `app\api\hx2\_lib\kgx-owner-approval-gate.ts`
- `app\api\hx2\_lib\kgx-plan-readiness-intelligence.ts`
- `app\api\hx2\_lib\kgx-prediction-decision-readiness.ts`
- `app\api\hx2\_lib\kgx-prediction-readiness-attribution.ts`
- `app\api\hx2\_lib\kgx-reinforcement-health.ts`
- `app\api\hx2\_lib\kgx-runtime-health-authority.ts`
- `app\api\hx2\_lib\manifest-health-summary.ts`
- `app\api\hx2\_lib\node-router.ts.bak_what_is_health`
- `app\api\hx2\_lib\phase3-diagnostics-package-gate.ts`
- `app\api\hx2\_lib\phase3b-build-health-snapshot.ts`
- `app\api\hx2\_lib\phase3b-release-manifest.ts`
- `app\api\hx2\_lib\registry-validation-package-gate.ts`
- `app\api\hx2\_lib\sprint-next-risk-gate.ts`
- `app\api\hx2\_lib\sprint-risk-gate-actions.ts`
- `app\api\hx2\_lib\unified-retrieval.ts.bak.relevance-gated-rss.1781296110`
- `app\api\hx2\chat-master-readiness\route.ts`
- `app\api\hx2\chat-master\route.ts.bak_healthoi_force_ah3`
- `app\api\hx2\kgx-health\route.ts`
- `app\api\hx2\kgx-plan-readiness-intelligence-preview\route.ts`
- `app\api\hx2\kgx-prediction-decision-readiness-preview\route.ts`
- `app\api\hx2\kgx-prediction-readiness-attribution-preview\route.ts`
- `app\api\hx2\kgx-reinforcement-health\route.ts`
- `app\api\hx2\kgx-runtime-health-authority-preview\route.ts`
- `app\api\hx2\phase10-final-promotion-gate\route.ts`
- `app\api\hx2\phase10-production-readiness\route.ts`
- `app\api\hx2\phase10-release-safety\route.ts`
- `app\api\hx2\phase3b-build-health\route.ts`
- `app\api\hx2\phase3b-release-manifest\route.ts`
- `app\api\hx2\phase5-production-promotion-gate\route.ts`
- `app\api\hx2\phase5-runtime-intelligence-aggregate\route.ts`
- `app\api\hx2\phase6-production-promotion-gate\route.ts`

## Decision Rule

Prefer the lane with the best combination of high MVP value, strong existing repo signal, and low/medium patch risk.

Avoid starting with billing/auth unless the repo already has strong implementation scaffolding and the next patch is narrowly verifiable.

