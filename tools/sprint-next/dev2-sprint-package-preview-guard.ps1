$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 SPRINT PACKAGE PREVIEW GUARD =="

$panel = "app/owner-console/_components/dev2-sprint-package-panel.tsx"
$verificationEscalationPanel = "app/owner-console/_components/verification-escalation-panel.tsx"
$sprintPanel = "app/owner-console/_components/sprint-next-panel.tsx"

foreach ($path in @($panel, $sprintPanel, $verificationEscalationPanel)) {
  if (!(Test-Path $path)) {
    throw "Missing required UI file: $path"
  }
}

$combined = (Get-Content $panel -Raw) + "`n" + (Get-Content $sprintPanel -Raw) + "`n" + (Get-Content $verificationEscalationPanel -Raw)

$required = @(
  "Dev2SprintPackagePanel",
  "DEV2 Sprint Package",
  "Operator Decision",
  "Telemetry Override",
  "Confidence Override",
  "Confidence Band",
  "Confidence Score",
  "Quality Override",
  "Telemetry Quality",
  "Learning Weights Applied",
  "Learning Weight Audit",
  "Learning Weight Strategy Audit",
  "Verification Escalation",
  "Escalated:",
  "Action:",
  "Verification Trust Posture",
  "Posture:",
  "Recursive Verification Audit",
  "Applied:",
  "Action:",
  "Status:",
  "Reason:",
  "Posture:",
  "Scope:",
  "Verification:",
  "Original Score",
  "Weighted Score",
  "Telemetry Bias",
  "Stability Bias",
  "Expansion Bias",
  "Decision:",
  "Message:",
  "Adaptive Modification Audit",
  "modified_fields",
  "Reason:",
  "Adaptive Package Strategy",
  "Strategy:",
  "Recommendation:",
  "Package Success Signal",
  "package_type",
  "success_score",
  "Files to Touch",
  "Execution Phases",
  "Copy-Ready PowerShell",
  "Commands",
  "Expected Guards",
  "Rollback",
  "dev2_sprint_package"
)

$missing = @()

foreach ($needle in $required) {
  if ($combined -notlike "*$needle*") {
    $missing += $needle
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- Missing: $m"
  }
  throw "DEV2 sprint package preview guard failed"
}

Write-Host "DEV2 SPRINT PACKAGE PREVIEW GUARD PASSED"















