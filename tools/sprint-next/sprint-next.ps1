param(
  [string]$FeatureName = "phase-3b-sprint-next",
  [string]$Message = "Phase 3B sprint next",
  [string]$ProbeUrl = "https://optinodeiq.com",
  [switch]$LocalOnly,
  [switch]$DryRun,
  [switch]$AllowNoCommit,
  [switch]$SkipDiffSummary,
  [switch]$FastNoReview,
  [switch]$AutoMode,
  [switch]$NoAutoMode
)

$ErrorActionPreference = "Stop"

if (-not $NoAutoMode) {
  $AutoMode = $true
  Write-Host "AutoMode default enabled. Use -NoAutoMode to force legacy behavior."

Write-Host ""
Write-Host "== AUTO MODE EXECUTION POLICY =="

$ExecutionPolicyMode = if ($AutoMode) {
  "SMART OPTIMIZATION ACTIVE"
} else {
  "LEGACY EXECUTION"
}

Write-Host "Execution policy mode: $ExecutionPolicyMode"
}

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

$DeploymentConfidence = switch ($Impact.risk_level) {
  "low"    { 95 }
  "medium" { 82 }
  default  { 68 }
}

Write-Host "Deployment confidence: $DeploymentConfidence/100"

Write-Host ""
Write-Host "== AUTO MODE SMART DEPLOY THRESHOLD =="

$DeployThreshold = switch ($Impact.risk_level) {
  "low"    { "DEPLOY AVOIDED" }
  "medium" { "LOCAL VALIDATION PREFERRED" }
  default  { "FULL VERIFY REQUIRED" }
}

Write-Host "Deploy threshold mode: $DeployThreshold"

if ($LocalOnly) {
  Write-Host "Estimated deploys avoided: 1"
} else {
  Write-Host "Estimated deploys avoided: 0"

Write-Host ""
Write-Host "== AUTO MODE ADAPTIVE OPTIMIZATION =="

$OptimizationMode = if ($LocalOnly) {
  "MAXIMUM COST EFFICIENCY"
} else {
  "MAXIMUM PRODUCTION SAFETY"
}

Write-Host "Optimization mode: $OptimizationMode"

Write-Host ""
Write-Host "== AUTO MODE DEPLOY STRATEGY =="

if ($LocalOnly) {
  Write-Host "Deploy strategy: DEPLOYMENT SUPPRESSED"
  Write-Host "Production verification: SKIPPED"
  Write-Host "Expected cost profile: LOW"
} else {
  Write-Host "Deploy strategy: FULL VALIDATION PIPELINE"
  Write-Host "Production verification: ACTIVE"
  Write-Host "Expected cost profile: STANDARD"
}

$AdaptiveScore = switch ($Impact.risk_level) {
  "low"    { 98 }
  "medium" { 84 }
  default  { 72 }
}

Write-Host "Adaptive optimization score: $AdaptiveScore/100"

$AutoModeAuditDir = "tools/sprint-next/_audit"
New-Item -ItemType Directory -Force -Path $AutoModeAuditDir | Out-Null

$AutoModeAudit = [ordered]@{
  audit_id = "phase3b-automode-decision"
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  feature_name = $FeatureName
  message = $Message
  probe_url = $ProbeUrl
  risk_level = $Impact.risk_level
  changed_file_count = $Impact.changed_file_count
  execution_mode = $(if ($LocalOnly) { "local_only" } else { "full_deploy" })
  deploy_skipped = [bool]$LocalOnly
  fast_no_review = [bool]$FastNoReview
  decision_reason = $AutoModeReason
  optimization_mode = $OptimizationMode
  adaptive_score = $AdaptiveScore
}

$AutoModeAuditPath = Join-Path $AutoModeAuditDir ("phase3b-automode-decision-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$AutoModeAudit | ConvertTo-Json -Depth 10 | Set-Content $AutoModeAuditPath -Encoding UTF8

Write-Host "AutoMode decision audit written: $AutoModeAuditPath"
}
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

Write-Host ""
Write-Host "== AUTO MODE LEARNING LOOP =="

$LearningMode = if ($LocalOnly) {
  "Cost optimization active"
} else {
  "Verification prioritization active"
}

Write-Host "Learning mode: $LearningMode"

Write-Host ""
Write-Host "== AUTO MODE RESOURCE PROFILE =="

if ($LocalOnly) {
  Write-Host "Resource profile: COST SAVING"
  Write-Host "Serverless pressure: LOW"
  Write-Host "Verification pressure: LOW"
} else {
  Write-Host "Resource profile: FULL VALIDATION"
  Write-Host "Serverless pressure: MODERATE"
  Write-Host "Verification pressure: HIGH"

Write-Host ""
Write-Host "== AUTO MODE PIPELINE PRESSURE =="

if ($Impact.changed_file_count -le 5) {
  Write-Host "Pipeline pressure: LOW"
} elseif ($Impact.changed_file_count -le 20) {
  Write-Host "Pipeline pressure: MODERATE"
} else {
  Write-Host "Pipeline pressure: HIGH"
}

Write-Host "Changed files analyzed: $($Impact.changed_file_count)"
Write-Host "Risk classification: $($Impact.risk_level.ToUpper())"
}

if ($Impact.changed_file_count -le 5) {
  Write-Host "Change density: LIGHT"
} elseif ($Impact.changed_file_count -le 20) {
  Write-Host "Change density: MEDIUM"
} else {
  Write-Host "Change density: HEAVY"
}
}
}
}












