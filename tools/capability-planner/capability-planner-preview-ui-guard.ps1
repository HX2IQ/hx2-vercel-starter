$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER PREVIEW UI GUARD =="

$panel = "app/owner-console/_components/capability-planner-panel.tsx"
$chatMasterPanels = "app/owner-console/_components/chat-master-panels.tsx"

if (!(Test-Path $panel)) {
  throw "Missing capability planner preview panel"
}

if (!(Test-Path $chatMasterPanels)) {
  throw "Missing chat master panels component"
}

$panelText = Get-Content $panel -Raw
$chatText = Get-Content $chatMasterPanels -Raw

$requiredPanel = @(
  "CapabilityPlannerPreviewPanel",
  "Capability Planner Preview",
  "Live orchestration intelligence preview",
  "Selected Node",
  "Execution Mode",
  "Escalated",
  "Pipeline Steps",
  "Orchestration Synthesis",
  "candidate_nodes",
  "execution_pipeline",
  "orchestration_synthesis"
)

$requiredMount = @(
  "CapabilityPlannerPreviewPanel",
  "./capability-planner-panel"
)

$missing = @()

foreach ($needle in $requiredPanel) {
  if ($panelText -notlike "*$needle*") {
    $missing += "Missing in preview panel: $needle"
  }
}

foreach ($needle in $requiredMount) {
  if ($chatText -notlike "*$needle*") {
    $missing += "Missing in chat master panels mount: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }
  throw "Capability planner preview UI guard failed"
}

Write-Host "CAPABILITY PLANNER PREVIEW UI GUARD PASSED"
