$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== VERIFICATION ESCALATION COMPONENT GUARD =="

$panel = "app/owner-console/_components/verification-escalation-panel.tsx"
$parent = "app/owner-console/_components/dev2-sprint-package-panel.tsx"

foreach ($path in @($panel, $parent)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$panelText = Get-Content $panel -Raw
$parentText = Get-Content $parent -Raw

$requiredPanel = @(
  "VerificationEscalationPanel",
  "Verification Escalation",
  "Escalated:",
  "Action:",
  "Reason:",
  "escalation"
)

$requiredParent = @(
  "VerificationEscalationPanel",
  "verification-escalation-panel",
  "verification_escalation"
)

$missing = @()

foreach ($needle in $requiredPanel) {
  if ($panelText -notlike "*$needle*") {
    $missing += "Missing in escalation panel: $needle"
  }
}

foreach ($needle in $requiredParent) {
  if ($parentText -notlike "*$needle*") {
    $missing += "Missing in parent panel: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Verification escalation component guard failed"
}

Write-Host "VERIFICATION ESCALATION COMPONENT GUARD PASSED"
