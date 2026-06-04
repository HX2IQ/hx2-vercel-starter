Write-Host "`n== DEV2 BUILD TRUTH SNAPSHOT =="

$Out = ".\HX2_BUILD_TRUTH_SNAPSHOT.md"

function SafeRead($Path) {
  try { return Get-Content -LiteralPath $Path -Raw -ErrorAction Stop }
  catch { return "" }
}

$GitStatus = git status --short
$GitHead = git rev-parse HEAD
$GitBranch = git branch --show-current
$GitLog = git log --oneline -10

$RouteFiles = Get-ChildItem ".\app\api" -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue
$Hx2Routes = $RouteFiles | Where-Object { $_.FullName -match "\\api\\hx2\\" }
$PhaseRoutes = $RouteFiles | Where-Object { $_.FullName -match "\\api\\hx2\\phase\d+" }
$BrainRoutes = $RouteFiles | Where-Object { $_.FullName -match "\\api\\brain\\" }
$Ap2Routes = $RouteFiles | Where-Object { $_.FullName -match "\\api\\ap2" }
$OwnerRoutes = $RouteFiles | Where-Object { $_.FullName -match "\\api\\owner\\" }

$Prisma = SafeRead ".\prisma\schema.prisma"
$HasRealPrismaModels = (($Prisma -match "model ") -and ($Prisma -notmatch "model Example"))

$CapabilityPlanner = SafeRead ".\app\api\hx2\capability-planner\route.ts"

if ($CapabilityPlanner -match "buildCapabilityPlan" -and $CapabilityPlanner.Length -lt 2000) {
  $CapabilityPlannerVerdict = "THIN_WRAPPER"
}
elseif ($CapabilityPlanner -match "prisma|redis|OpenAI|fetch\(|routing|capability") {
  $CapabilityPlannerVerdict = "PARTIAL_REAL_SYSTEM"
}
else {
  $CapabilityPlannerVerdict = "UNKNOWN"
}

$BrainChat = SafeRead ".\app\api\brain\chat\route.ts"
$BrainRun = SafeRead ".\app\api\brain\run\route.ts"
$Ap2Enqueue = SafeRead ".\app\api\ap2\task\enqueue\route.ts"
$Ap2Status = SafeRead ".\app\api\ap2\task\status\route.ts"
$OwnerRemote = SafeRead ".\app\api\owner\remote-result\route.ts"

function Verdict($Text) {
  $Real = 0

  foreach ($Pattern in @("OpenAI","fetch\(","redis","upstash","process\.env","await ","POST","GET","queue","memory","execute","run")) {
    if ($Text -match $Pattern) {
      $Real++
    }
  }

  if ($Real -ge 7) { return "WORKING_CANDIDATE" }
  if ($Real -ge 4) { return "PARTIAL_REAL_SYSTEM" }
  if ($Text.Length -gt 0) { return "THIN_OR_UNKNOWN" }

  return "MISSING"
}

if ($GitStatus) {
  $GitStatusText = $GitStatus | Out-String
}
else {
  $GitStatusText = "CLEAN"
}

if ($HasRealPrismaModels) {
  $PrismaVerdict = "REAL MODELS PRESENT"
}
else {
  $PrismaVerdict = "NO MEANINGFUL MODELS - schema is placeholder/thin"
}

$Snapshot = @"
# HX2 BUILD TRUTH SNAPSHOT

Generated: $(Get-Date)

## Rule

Repo truth overrides chat memory.

This file is the first file a new DEV2/HX2 chat should read before continuing any sprint.

## Git Truth

Branch:

$GitBranch

HEAD:

$GitHead

Working tree:

$GitStatusText

Recent commits:

$($GitLog | Out-String)

## Route Topology

- Total API routes: $($RouteFiles.Count)
- HX2 routes: $($Hx2Routes.Count)
- HX2 phase/contract routes: $($PhaseRoutes.Count)
- Brain routes: $($BrainRoutes.Count)
- AP2 routes: $($Ap2Routes.Count)
- Owner routes: $($OwnerRoutes.Count)

## Current Build Reality

### Framework / Contract System

Status: BUILT

Evidence:
- Phase route topology exists
- Phase 7-10 contract stack exists
- Production verification gates exist
- DEV2 build workflow exists

### Intelligence Runtime

Status: PARTIAL

Subsystem verdicts:

- Brain chat: $(Verdict $BrainChat)
- Brain run: $(Verdict $BrainRun)
- AP2 enqueue: $(Verdict $Ap2Enqueue)
- AP2 task status: $(Verdict $Ap2Status)
- Owner remote result: $(Verdict $OwnerRemote)
- Capability planner: $CapabilityPlannerVerdict

### Persistent Memory / KGX

Status: NOT BUILT ENOUGH

Prisma schema verdict:

$PrismaVerdict

## Critical Gap

Phase 1-10 roadmap completion does not mean HX2 is a complete intelligent system.

Current best estimate:

- Framework / routes / gates: 90%+
- Runtime plumbing: 45-60%
- Actual intelligence layer: 25-40%
- Persistent intelligent system: 10-20%

## Highest Priority Next Target

Build KGX-Lite + Execution Memory.

Reason:
HX2 cannot become a functioning intelligent system until it can persist:
- memory
- node state
- capability plans
- execution history
- reasoning traces
- route outcomes
- audit events

## Do Not Continue Blind Phase Expansion

Before creating any Phase 11 or additional contract stack, implement real capability layers.

Recommended next implementation track:

1. KGX-Lite Memory Schema
2. Execution Memory Tables
3. Capability Planner Persistence
4. Brain Memory Read/Write Loop
5. AP2 Execution History Persistence
6. Owner Console Truth Dashboard

## DEV2 Recovery Instruction

For every new chat:

1. Read this file.
2. Run git status.
3. Verify HEAD.
4. Run local build if code changed.
5. Verify production only after deployment.
6. Never treat static contract routes as proof of real intelligence.

"@

Set-Content -Path $Out -Value $Snapshot -Encoding UTF8

Write-Host "`nSNAPSHOT CREATED: $Out"
Get-Content -LiteralPath $Out -TotalCount 180
