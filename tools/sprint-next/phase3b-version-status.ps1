param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B VERSION STATUS =="

$Response = Invoke-RestMethod "$BaseUrl/api/hx2/phase3b-build-process-version"

Write-Host "Route: $($Response.route)"
Write-Host "Process mode: $($Response.process_mode)"
Write-Host "Process version: $($Response.process_version)"
Write-Host "Composition mutation allowed: $($Response.composition_mutation_allowed)"

Write-Host ""
Write-Host "== CAPABILITIES =="
$Response.capabilities.PSObject.Properties | ForEach-Object {
  Write-Host "$($_.Name): $($_.Value)"
}

Write-Host ""
Write-Host "== RELEASE NOTES =="
$Response.release_notes | ForEach-Object {
  Write-Host "- $_"
}
