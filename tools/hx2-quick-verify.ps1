$ErrorActionPreference = "Stop"

$overall = [System.Diagnostics.Stopwatch]::StartNew()

$results = @()

Write-Host ""
Write-Host "== HX2 QUICK VERIFY ==" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".\tools\hx2-local-env-check.ps1") {
  powershell -ExecutionPolicy Bypass -File .\tools\hx2-local-env-check.ps1
}

$guards = @(
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
  ".\tools\owner-console-panel-order-guard.ps1"
)

foreach ($guard in $guards) {
  if (!(Test-Path $guard)) {
    throw "Missing quick guard: $guard"
  }

  $sw = [System.Diagnostics.Stopwatch]::StartNew()

  Write-Host ""
  Write-Host "Running $guard" -ForegroundColor Yellow

  powershell -ExecutionPolicy Bypass -File $guard

  $sw.Stop()

  $results += [pscustomobject]@{
    Guard = Split-Path $guard -Leaf
    Milliseconds = $sw.ElapsedMilliseconds
  }

  Write-Host ("Completed in {0} ms" -f $sw.ElapsedMilliseconds) -ForegroundColor DarkGray

  if ($LASTEXITCODE -ne 0) {
    throw "Quick verify failed: $guard"
  }
}

$overall.Stop()

Write-Host ""
Write-Host "QUICK VERIFY SUMMARY" -ForegroundColor Cyan
$results | Format-Table -AutoSize

Write-Host ""
Write-Host ("HX2 QUICK VERIFY PASSED ({0} ms total)" -f $overall.ElapsedMilliseconds) -ForegroundColor Green




























