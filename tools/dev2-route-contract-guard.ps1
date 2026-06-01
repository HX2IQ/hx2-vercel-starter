param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 ROUTE CONTRACT GUARD =="

$Routes = @(
  "runtime-intelligence-dependency-validation",
  "runtime-intelligence-graph-integrity-summary",
  "runtime-intelligence-execution-readiness"
)

foreach ($Route in $Routes) {
  $LocalPath = "app/api/hx2/$Route/route.ts"

  if (!(Test-Path $LocalPath)) {
    throw "Missing local route file: $LocalPath"
  }

  $ArtifactPath = ".next/server/app/api/hx2/$Route/route.js"

  if ((Test-Path ".next") -and !(Test-Path $ArtifactPath)) {
    throw "Missing local build artifact: $ArtifactPath"
  }
}

foreach ($Route in $Routes) {
  $Url = "$BaseUrl/api/hx2/${Route}?cb=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"

  Write-Host "Checking: $Url"

  try {
    $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction Stop
  }
  catch {
    $Status = $_.Exception.Response.StatusCode.value__
    throw "Production route failed: $Route status=$Status url=$Url"
  }

  if ($Response.StatusCode -ne 200) {
    throw "Unexpected status for $Route : $($Response.StatusCode)"
  }

  Write-Host "$Route : LIVE"
}

Write-Host "DEV2 ROUTE CONTRACT GUARD PASSED"

