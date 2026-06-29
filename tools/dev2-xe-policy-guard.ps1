$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE POLICY GUARD =="

$CharterFile = ".\tools\DEV2-XE-CHARTER.md"

if (-not (Test-Path $CharterFile)) {
  throw "Missing DEV2-XE charter: $CharterFile"
}

$Text = Get-Content $CharterFile -Raw

$RequiredMarkers = @(
  "DEV2-XE",
  "Codex-parity execution layer",
  "No script may auto-push or auto-deploy without explicit command-level approval",
  "Inspect",
  "Typecheck",
  "Build",
  "Verify",
  "Push only with explicit approval",
  "Deploy only with explicit approval",
  "Bundled sprints are allowed",
  "Single focused sprint is required"
)

$Rows = @()

foreach ($Marker in $RequiredMarkers) {
  $Rows += [pscustomobject]@{
    Marker = $Marker
    Status = if ($Text.Contains($Marker)) { "GREEN" } else { "RED" }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

Write-Host ""
Write-Host "DEV2-XE POLICY SUMMARY"
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "This guard confirms DEV2-XE has a local governing charter before execution automation is added."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2-XE policy guard failed."
}

Write-Host "GREEN: DEV2-XE policy guard passed."

