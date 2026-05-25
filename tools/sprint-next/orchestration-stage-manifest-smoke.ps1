param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION STAGE MANIFEST SMOKE =="

$response = Invoke-RestMethod `
  -Method GET `
  -Uri "$BaseUrl/api/hx2/orchestration-stage-manifest"

$response | ConvertTo-Json -Depth 10

if (-not $response.ok) {
  throw "Manifest API returned ok=false"
}

if (-not $response.stage_registry) {
  throw "Missing stage_registry"
}

Write-Host ""
Write-Host "ORCHESTRATION STAGE MANIFEST SMOKE PASSED"
