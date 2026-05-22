$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION OUTCOME SUMMARY SCRIPT GUARD =="

$file = "tools/orchestration-outcome/summary-outcome.ps1"

if (!(Test-Path $file)) {
  throw "Missing summary-outcome.ps1"
}

$text = Get-Content $file -Raw

$required = @(
  "BaseUrl",
  "Invoke-RestMethod",
  "/api/hx2/orchestration-outcome-summary",
  "Outcome summary retrieved"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Orchestration outcome summary script guard failed"
}

Write-Host "ORCHESTRATION OUTCOME SUMMARY SCRIPT GUARD PASSED"
