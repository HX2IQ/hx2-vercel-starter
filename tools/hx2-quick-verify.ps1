param(
  [switch]$Compact,
  [int]$SlowGuardCount = 5,
  [switch]$Fast
)

$ErrorActionPreference = "Stop"



# HX2 verify run log
$VerifyRunDir = Join-Path "tools" "_verify-runs"
New-Item -ItemType Directory -Force -Path $VerifyRunDir | Out-Null
$VerifyRunStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$VerifyRunLog = Join-Path $VerifyRunDir "hx2-quick-verify-$VerifyRunStamp.log"

function Write-Hx2VerifyRunLog {
  param([string]$Message)
  $Line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
  Add-Content -Path $VerifyRunLog -Value $Line
}

Write-Hx2VerifyRunLog "HX2 quick verify started"
$overall = [System.Diagnostics.Stopwatch]::StartNew()


$VerifyModeLabel = "FULL"
if ($Fast) {
  $VerifyModeLabel = "FAST"
}
$results = @()

if ($Compact) {
  Write-Host "HX2 quick compact mode enabled" -ForegroundColor Cyan
}

Write-Host ""
Write-Host ("== HX2 QUICK VERIFY [{0}] ==" -f $VerifyModeLabel) -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".\tools\hx2-local-env-check.ps1") {
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\hx2-local-env-check.ps1
}

$guards = @(
  ".\tools\sprint-next\phase3-orchestration-diagnostics-guard.ps1",
  ".\tools\sprint-next\manifest-health-summary-guard.ps1",
  ".\tools\sprint-next\orchestration-stage-manifest-preview-guard.ps1",
  ".\tools\sprint-next\orchestration-stage-manifest-api-guard.ps1",
  ".\tools\sprint-next\execution-lineage-integrity-guard.ps1",
  ".\tools\sprint-next\execution-package-lineage-guard.ps1",
  ".\tools\sprint-next\registry-driven-orchestration-validation-guard.ps1",
  ".\tools\sprint-next\orchestration-stage-registry-integrity-guard.ps1",
  ".\tools\sprint-next\orchestration-stage-registry-guard.ps1",
  ".\tools\sprint-next\sprint-next-stage-helper-existence-guard.ps1",
  ".\tools\sprint-next\sprint-next-composition-anchor-guard.ps1",
  ".\tools\sprint-next\sprint-next-composition-variable-guard.ps1",
  ".\tools\sprint-next\verification-escalation-component-guard.ps1",
  ".\tools\sprint-next\sprint-next-composition-order-guard.ps1",
  ".\tools\orchestration-outcome\learning-weights-summary-preview-guard.ps1",
  ".\tools\orchestration-outcome\learning-weights-summary-api-guard.ps1",
  ".\tools\orchestration-outcome\summary-outcome-guard.ps1",
  ".\tools\orchestration-outcome\record-outcome-guard.ps1",
  ".\tools\orchestration-outcome\orchestration-outcome-summary-preview-guard.ps1",
  ".\tools\orchestration-outcome\orchestration-outcome-evaluator-guard.ps1",
  ".\tools\sprint-next\dev2-sprint-package-preview-guard.ps1",
  ".\tools\dev2\transient-cleanup-guard.ps1",
  ".\tools\dev2\scratch-workspace-guard.ps1",
  ".\tools\dev2\self-cleaning-smoke-guard.ps1",
  ".\tools\dev2\insert-panel-guard.ps1",
  ".\tools\dev2\canonical-panel-inserter-guard.ps1",
  ".\tools\dev2\dev2-tsx-mutation-safety-guard.ps1",
  ".\tools\sprint-next\sprint-next-preview-ui-guard.ps1",
  ".\tools\sprint-next\sprint-history-summary-guard.ps1",
  ".\tools\capability-planner\capability-plan-type-contract-guard.ps1",
  ".\tools\capability-planner\owner-console-planner-panel-structure-guard.ps1",
  ".\tools\sprint-next\sprint-next-local-contract-test.ps1",
  ".\tools\sprint-next\sprint-next-api-guard.ps1",
  ".\tools\capability-planner\capability-planner-local-contract-test.ps1",
  ".\tools\capability-planner\capability-planner-preview-ui-guard.ps1",
  ".\tools\capability-planner\capability-planner-guard.ps1",
  ".\tools\guard-hx2-syntax.ps1",
  ".\tools\orchestrator\hx2-orchestrator-guard-bundle.ps1",
  ".\tools\chat-master\chat-master-status-guard.ps1",
  ".\tools\owner-console-layout-guard.ps1",
  ".\tools\owner-console-panel-order-guard.ps1",
  ".\tools\dev2-team-sprint-manifest-guard.ps1"
)


if ($Fast) {
  Write-Host "HX2 quick fast mode enabled: TypeScript syntax/type guard is skipped for low-risk iteration." -ForegroundColor Yellow
  Write-Host "FULL VERIFY REQUIRED before commit/push for code or route changes." -ForegroundColor Yellow
  $guards = @(
    $guards |
      Where-Object { (Split-Path $_ -Leaf) -ne "guard-hx2-syntax.ps1" }

if ($Fast) {
  Write-Host ""
  Write-Host "FAST VERIFY NOTICE: this is for low-risk iteration only." -ForegroundColor Yellow
  Write-Host "FINAL SAFETY GATE: run npm run hx2:quick:compact before commit/push on code, routes, retrieval, orchestrator, auth, billing, or fragile changes." -ForegroundColor Yellow
}
  )
}

foreach ($guard in $guards) {
  if (!(Test-Path $guard)) {
    throw "Missing quick guard: $guard"
  }

  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $guardName = Split-Path $guard -Leaf
  $logFile = $null

  if ($Compact) {
    $logFile = Join-Path $env:TEMP ("hx2-quick-" + $guardName + ".log")
    powershell -NoProfile -ExecutionPolicy Bypass -File $guard *> $logFile
    $exitCode = $LASTEXITCODE
  } else {
    Write-Host ""
    Write-Host "Running $guard" -ForegroundColor Yellow

    powershell -NoProfile -ExecutionPolicy Bypass -File $guard
    $exitCode = $LASTEXITCODE
  }

  $sw.Stop()

  $results += [pscustomobject]@{
    Guard = $guardName
    Milliseconds = $sw.ElapsedMilliseconds
  }

  if ($exitCode -ne 0) {
    if ($Compact -and $logFile -and (Test-Path $logFile)) {
      Write-Host ""
      Write-Host "FAILED LOG: $guardName" -ForegroundColor Red
      Get-Content $logFile
    }

    throw "Quick verify failed: $guard"
  }

  if ($Compact) {
    Write-Host ("GREEN: {0} ({1} ms)" -f $guardName, $sw.ElapsedMilliseconds)
  } else {
    Write-Host ("Completed in {0} ms" -f $sw.ElapsedMilliseconds) -ForegroundColor DarkGray
  }
}

$overall.Stop()

Write-Host ""
Write-Host "QUICK VERIFY SUMMARY" -ForegroundColor Cyan

if ($Compact) {
  Write-Host ("Guards passed: {0}" -f $results.Count)

  $slowest =
    $results |
      Sort-Object Milliseconds -Descending |
      Select-Object -First $SlowGuardCount

  if ($slowest.Count -gt 0) {
    Write-Host ""
    Write-Host ("SLOW-GUARD RADAR: top {0}" -f $SlowGuardCount) -ForegroundColor Cyan

    foreach ($item in $slowest) {
      Write-Host ("- {0}: {1} ms" -f $item.Guard, $item.Milliseconds)
    }
  }
} else {
  $results | Format-Table -AutoSize
}

Write-Host ""
Write-Host ("HX2 QUICK VERIFY PASSED ({0} ms total)" -f $overall.ElapsedMilliseconds) -ForegroundColor Green

Write-Host "`n== STRICT RETRIEVAL QUALITY VERIFY BUNDLE =="
$RetrievalVerifyBundle = Join-Path $PSScriptRoot "retrieval-quality\hx2-retrieval-quality-verify-bundle.ps1"

if (-not (Test-Path $RetrievalVerifyBundle)) {
  throw "Missing retrieval quality verify bundle script: $RetrievalVerifyBundle"
}

$global:LASTEXITCODE = 0
powershell -NoProfile -ExecutionPolicy Bypass -File $RetrievalVerifyBundle -StrictTrust
$RetrievalVerifyExitCode = $LASTEXITCODE

if ($RetrievalVerifyExitCode -ne 0) {
  throw "Retrieval quality verify bundle failed with exit code $RetrievalVerifyExitCode."
}

Write-Host "GREEN: strict retrieval quality verify bundle passed"


Write-Hx2VerifyRunLog "HX2 quick verify completed successfully"
Write-Hx2VerifyRunLog ("Total runtime ms: {0}" -f $overall.ElapsedMilliseconds)
Write-Hx2VerifyRunLog ("Guard count: {0}" -f $results.Count)
Write-Hx2VerifyRunLog ("Compact mode: {0}" -f ([bool]$Compact))
Write-Hx2VerifyRunLog ("Fast mode: {0}" -f ([bool]$Fast))
Write-Hx2VerifyRunLog ("Verify mode label: {0}" -f $VerifyModeLabel)
Write-Hx2VerifyRunLog "Strict retrieval quality verify bundle: passed"
Write-Hx2VerifyRunLog "Slow-guard radar:"

foreach ($item in ($results | Sort-Object Milliseconds -Descending | Select-Object -First $SlowGuardCount)) {
  Write-Hx2VerifyRunLog ("- {0}: {1} ms" -f $item.Guard, $item.Milliseconds)
}

Write-Host "GREEN: verify run log written to $VerifyRunLog"





