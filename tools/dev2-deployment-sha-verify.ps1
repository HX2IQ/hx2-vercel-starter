param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 DEPLOYMENT SHA VERIFICATION =="

$LocalSha = git rev-parse HEAD

Write-Host ""
Write-Host "Local SHA:"
Write-Host $LocalSha

$Route = "$BaseUrl/api/hx2/phase3b-build-process-version?cb=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"

Write-Host ""
Write-Host "Checking:"
Write-Host $Route

try {

  $Response = Invoke-RestMethod $Route -ErrorAction Stop

  Write-Host ""
  Write-Host "Live route reachable."

  $Json = $Response | ConvertTo-Json -Depth 20

  $HasCommit = $Json -match $LocalSha.Substring(0,7)

  if ($HasCommit) {
    Write-Host ""
    Write-Host "DEPLOYMENT SHA MATCH VERIFIED"
    exit 0
  }

  Write-Host ""
  Write-Host "WARNING:"
  Write-Host "Could not confirm deployment SHA from route payload."
  Write-Host "Manual verification may still be required."

}
catch {

  Write-Host ""
  Write-Host "FAILED TO VERIFY DEPLOYMENT SHA"
  Write-Host $_.Exception.Message
  exit 1
}
