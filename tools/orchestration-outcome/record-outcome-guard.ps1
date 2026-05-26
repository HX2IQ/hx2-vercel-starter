$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION OUTCOME RECORD SCRIPT GUARD =="

$file = "tools/orchestration-outcome/record-outcome.ps1"

if (!(Test-Path $file)) {
  throw "Missing record-outcome.ps1"
}

$text = Get-Content $file -Raw

$required = @(
  "BaseUrl",
  "ExecutionId",
  "RuntimeStatus",
  "CompletedGuards",
  "Invoke-RestMethod",
  "/api/hx2/orchestration-outcome",
  "Outcome record submitted"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration outcome record script guard failed"
}

Write-Host "ORCHESTRATION OUTCOME RECORD SCRIPT GUARD PASSED"
