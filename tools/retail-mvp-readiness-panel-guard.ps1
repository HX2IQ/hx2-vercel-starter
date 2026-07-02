$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETAIL MVP READINESS PANEL GUARD ==" -ForegroundColor Cyan
Write-Host "Mode: static tool contract"
Write-Host "Secrets printed: false"

$PanelFile = ".\tools\retail-mvp-readiness-panel.ps1"

if (-not (Test-Path $PanelFile)) {
  throw "Missing retail MVP readiness panel: $PanelFile"
}

$Raw = Get-Content $PanelFile -Raw

$Markers = @(
  @{ Name = "panel header"; Pattern = "HX2 RETAIL MVP READINESS PANEL" },
  @{ Name = "readiness matrix"; Pattern = "RETAIL MVP READINESS MATRIX" },
  @{ Name = "readiness summary"; Pattern = "RETAIL MVP READINESS SUMMARY" },
  @{ Name = "next actions"; Pattern = "NEXT ACTIONS" },
  @{ Name = "chat-master lane"; Pattern = "Core chat-master API" },
  @{ Name = "retrieval trust lane"; Pattern = "Retrieval trust gate" },
  @{ Name = "source evidence lane"; Pattern = "Source evidence contract" },
  @{ Name = "verify speed lane"; Pattern = "Verify speed layer" },
  @{ Name = "team execution lane"; Pattern = "DEV2 team execution mode" },
  @{ Name = "owner console lane"; Pattern = "Owner console" },
  @{ Name = "billing lane"; Pattern = "Pricing / billing" },
  @{ Name = "auth lane"; Pattern = "Auth / accounts" },
  @{ Name = "onboarding lane"; Pattern = "Onboarding / first-run" },
  @{ Name = "micro-sprint warning"; Pattern = "Handle in micro-sprints only" },
  @{ Name = "no secrets marker"; Pattern = "Secrets printed: false" }
)

$Rows = foreach ($Marker in $Markers) {
  $Ok = $Raw -match [regex]::Escape($Marker.Pattern)

  [pscustomobject]@{
    Marker = $Marker.Name
    Status = if ($Ok) { "GREEN" } else { "RED" }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

Write-Host ""
Write-Host "RETAIL MVP READINESS PANEL GUARD SUMMARY" -ForegroundColor Cyan
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "Confirms the retail MVP readiness panel exposes the required launch-readiness lanes without printing secrets."
} | Format-List

if ($Red -gt 0) {
  throw "Retail MVP readiness panel guard failed."
}

Write-Host ""
Write-Host "GREEN: HX2 retail MVP readiness panel guard passed."

