$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 TEAM SPRINT PREVIEW GUARD =="
Write-Host "Mode: team-build accelerator preview contract"
Write-Host "Secrets printed: false"

$PreviewFile = ".\tools\dev2-team-sprint-preview.ps1"
$ManifestFile = ".\tools\dev2-team-sprint-manifest.template.json"

if (-not (Test-Path $PreviewFile)) {
  throw "Missing team sprint preview script: $PreviewFile"
}

if (-not (Test-Path $ManifestFile)) {
  throw "Missing team sprint manifest template: $ManifestFile"
}

$Preview = Get-Content $PreviewFile -Raw
$Manifest = Get-Content $ManifestFile -Raw

$Markers = @(
  @{ Name = "preview heading"; Text = "DEV2 TEAM SPRINT PREVIEW"; Source = $Preview },
  @{ Name = "json mode"; Text = "[switch]$Json"; Source = $Preview },
  @{ Name = "risk classifier"; Text = "Get-RiskClassForPath"; Source = $Preview },
  @{ Name = "verify tier mapper"; Text = "Get-VerifyTierForRisk"; Source = $Preview },
  @{ Name = "changed file risk map"; Text = "CHANGED FILE RISK MAP"; Source = $Preview },
  @{ Name = "hot file coordination"; Text = "HOT FILE COORDINATION"; Source = $Preview },
  @{ Name = "architect lane present"; Text = "Architect"; Source = $Manifest },
  @{ Name = "planner lane present"; Text = "Planner"; Source = $Manifest },
  @{ Name = "implementer lane present"; Text = "Implementer"; Source = $Manifest },
  @{ Name = "QA lane present"; Text = "QA"; Source = $Manifest },
  @{ Name = "release manager lane present"; Text = "Release Manager"; Source = $Manifest },
  @{ Name = "docs lane present"; Text = "Docs"; Source = $Manifest }
)

$Rows = foreach ($Marker in $Markers) {
  [pscustomobject]@{
    Marker = $Marker.Name
    Status = if ($Marker.Source.Contains($Marker.Text)) { "GREEN" } else { "RED" }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "DEV2 TEAM SPRINT PREVIEW SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Meaning = "Confirms DEV2 team sprint preview exposes lanes, hot-file coordination, changed-file risk mapping, and verify-tier recommendation."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2 team sprint preview guard failed."
}

Write-Host "GREEN: DEV2 team sprint preview guard passed."

