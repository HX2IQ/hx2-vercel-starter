param(
  [string]$FeatureName = "phase-3b-sprint-next",
  [string]$Message = "Phase 3B sprint next",
  [string]$ProbeUrl = "https://optinodeiq.com",
  [switch]$LocalOnly,
  [switch]$DryRun,
  [switch]$AllowNoCommit,
  [switch]$SkipDiffSummary,
  [switch]$FastNoReview,
  [switch]$AutoMode
)

$ErrorActionPreference = "Stop"

if ($AutoMode) {
  Write-Host ""
  Write-Host "== SPRINT NEXT AUTO MODE =="

  powershell -ExecutionPolicy Bypass -File ".\tools\sprint-next\phase3b-impact-scan.ps1"

  $AuditDir = "tools/sprint-next/_audit"
  $LatestImpact = Get-ChildItem $AuditDir -Filter "phase3b-impact-scan-*.json" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($null -eq $LatestImpact) {
    throw "AutoMode could not find latest impact scan audit."
  }

  $Impact = Get-Content $LatestImpact.FullName -Raw | ConvertFrom-Json

  Write-Host "Impact risk level: $($Impact.risk_level)"
  Write-Host "Changed file count: $($Impact.changed_file_count)"

$AutoModeReason = switch ($Impact.risk_level) {
  "low"    { "Guard/script-only or metadata-level changes." }
  "medium" { "Moderate local impact with low production risk." }
  default  { "Production/API/runtime behavior affected." }
}

Write-Host "Decision reason: $AutoModeReason"

  Write-Host ""
Write-Host "== AUTO MODE RESULT =="

if ($Impact.risk_level -eq "low" -or $Impact.risk_level -eq "medium") {
    Write-Host "Auto decision: LocalOnly validation. No Vercel deploy."
Write-Host "Execution mode: LOCAL ONLY"
Write-Host "Expected Vercel usage: minimal"
Write-Host "Expected VPS usage: minimal"
Write-Host "Estimated deploy savings: HIGH"
    $LocalOnly = $true
  } else {
    Write-Host "Auto decision: Full deploy + production verification."
Write-Host "Execution mode: FULL DEPLOY"
Write-Host "Expected Vercel usage: elevated"
Write-Host "Expected VPS usage: elevated"
Write-Host "Estimated deploy savings: LOW"
  }
}

$ArgsList = @(
  "-ExecutionPolicy", "Bypass",
  "-File", ".\tools\sprint-next\phase3b-fast-safe-sprint.ps1",
  "-FeatureName", $FeatureName,
  "-Message", $Message,
  "-ProbeUrl", $ProbeUrl
)

if ($LocalOnly) { $ArgsList += "-LocalOnly" }
if ($DryRun) { $ArgsList += "-DryRun" }
if ($AllowNoCommit) { $ArgsList += "-AllowNoCommit" }
if ($SkipDiffSummary) { $ArgsList += "-SkipDiffSummary" }
if ($FastNoReview) { $ArgsList += "-SkipDiffSummary" }

powershell @ArgsList


