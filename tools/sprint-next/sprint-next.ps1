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
Write-Host "== AUTO MODE CHANGE CLASSIFICATION =="

switch ($Impact.risk_level) {
  "low" {
    Write-Host "Change class: Guard / metadata / tooling"
  }
  "medium" {
    Write-Host "Change class: Moderate local runtime impact"
  }
  default {
    Write-Host "Change class: Production runtime / API impact"
  }
}

Write-Host ""
Write-Host "== AUTO MODE TELEMETRY =="
Write-Host "Feature name: $FeatureName"
Write-Host "Probe URL: $ProbeUrl"
Write-Host "Fast review: $FastNoReview"
Write-Host "Local only forced: $LocalOnly"

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

Write-Host ""
Write-Host "== AUTO MODE EXECUTION SUMMARY =="
Write-Host "Risk level: $($Impact.risk_level)"
Write-Host "Execution mode selected: $(if ($LocalOnly) { "LOCAL ONLY" } else { "FULL DEPLOY" })"
Write-Host "Fast review mode: $FastNoReview"
Write-Host "Deploy skipped: $LocalOnly"

$SprintStartedAt = Get-Date

powershell @ArgsList

$SprintDuration = [math]::Round(((Get-Date) - $SprintStartedAt).TotalSeconds, 2)

Write-Host ""
Write-Host "Sprint duration seconds: $SprintDuration"

Write-Host ""
Write-Host "== AUTO MODE HISTORICAL TELEMETRY =="

$TelemetryDir = "tools/sprint-next/_audit"

if (Test-Path $TelemetryDir) {
  $RecentAudits = Get-ChildItem $TelemetryDir -Filter "phase3b-fast-safe-sprint-*.json" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 10

  Write-Host "Recent sprint audits analyzed: $($RecentAudits.Count)"

  if ($RecentAudits.Count -gt 0) {
    Write-Host "Historical telemetry mode: ACTIVE"
  } else {
    Write-Host "Historical telemetry mode: WARMING"
  }
} else {
  Write-Host "Historical telemetry mode: UNAVAILABLE"
}

Write-Host ""
Write-Host "== AUTO MODE COST ESTIMATE =="

if ($LocalOnly) {
  Write-Host "Estimated Vercel build impact: near zero"
  Write-Host "Estimated VPS impact: near zero"
  Write-Host "Estimated savings mode: ACTIVE"
} else {
  Write-Host "Estimated Vercel build impact: standard deploy usage"
  Write-Host "Estimated VPS impact: production verification active"
  Write-Host "Estimated savings mode: INACTIVE"

Write-Host ""
Write-Host "== AUTO MODE EFFICIENCY SCORE =="

$EfficiencyScore = if ($LocalOnly) { 95 } else { 65 }

Write-Host "Efficiency score: $EfficiencyScore/100"

if ($EfficiencyScore -ge 90) {
  Write-Host "Efficiency classification: HIGH"
} elseif ($EfficiencyScore -ge 75) {
  Write-Host "Efficiency classification: MEDIUM"
} else {
  Write-Host "Efficiency classification: STANDARD"

Write-Host ""
Write-Host "== AUTO MODE SPEED PROFILE =="

if ($LocalOnly) {
  Write-Host "Speed profile: OPTIMIZED"
  Write-Host "Expected deploy latency: skipped"
} else {
  Write-Host "Speed profile: VERIFIED"
  Write-Host "Expected deploy latency: standard"
}
}
}






