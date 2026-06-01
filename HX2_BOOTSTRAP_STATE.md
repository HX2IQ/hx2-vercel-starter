# HX2 BOOTSTRAP STATE

Canonical repo:
HX2IQ/hx2-vercel-starter

Canonical branch:
main

Canonical production domain:
https://optinodeiq.com

Canonical Vercel project:
optinodeiq

Current architecture status:
- Phase 3B active
- Runtime intelligence stack active
- KGX-lite lineage active
- Runtime graph traversal active
- Runtime graph cycle detection active
- DEV2 Structured Mutation Mode active
- Deployment continuity hardening active

Critical deployment lesson:
The recent 404 incident was caused by verification tooling drift, not broken deployed routes. PowerShell URL construction used `$Route?cb=...`, which produced malformed URLs. Correct form is `${Route}?cb=...`.

Current verified live routes:
- /api/hx2/runtime-intelligence-dependency-validation
- /api/hx2/runtime-intelligence-graph-integrity-summary
- /api/hx2/runtime-intelligence-execution-readiness

DEV2 rule:
Before continuing feature sprints, deployment topology and live route contracts must pass.
