param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 POSTDEPLOY VERIFY =="

$CriticalRoutes = @(
  "runtime-intelligence-dependency-validation",
  "runtime-intelligence-graph-integrity-summary",
  "runtime-intelligence-execution-readiness",
  "phase3b-build-process-version",
  "phase3b-route-contract-summary"
)

foreach ($Route in $CriticalRoutes) {

  $Url = "$BaseUrl/api/hx2/${Route}?cb=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"

  try {

    $Response = Invoke-RestMethod $Url -ErrorAction Stop

    Write-Host "[LIVE] $Route"

  }
  catch {

    Write-Host "[FAILED] $Route"
    Write-Host $_.Exception.Message

    exit 1
  }
}

Write-Host ""
Write-Host "DEV2 POSTDEPLOY VERIFY PASSED"
