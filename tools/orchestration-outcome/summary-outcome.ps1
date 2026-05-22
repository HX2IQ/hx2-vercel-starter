param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== ORCHESTRATION OUTCOME SUMMARY =="

$response = Invoke-RestMethod `
  -Method GET `
  -Uri "$BaseUrl/api/hx2/orchestration-outcome-summary"

$response | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "Outcome summary retrieved."
