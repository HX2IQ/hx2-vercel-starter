$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== OWNER CONSOLE PLANNER PANEL STRUCTURE GUARD =="

$files = @(
  "app/owner-console/_components/capability-planner-panel.tsx",
  "app/owner-console/_components/sprint-next-panel.tsx",
  "app/owner-console/_components/chat-master-panels.tsx"
)

foreach ($file in $files) {
  if (!(Test-Path $file)) {
    throw "Missing required component: $file"
  }
}

$capability = Get-Content "app/owner-console/_components/capability-planner-panel.tsx" -Raw
$sprint = Get-Content "app/owner-console/_components/sprint-next-panel.tsx" -Raw
$chat = Get-Content "app/owner-console/_components/chat-master-panels.tsx" -Raw

$requiredCapability = @(
  "function PlannerStat",
  "return (",
  "</div>",
  "CapabilityPlannerPreviewPanel",
  "Capability Planner Preview",
  "Learning Signals",
  "Adaptive Score Audit"
)

$requiredSprint = @(
  "SprintNextPreviewPanel",
  "Sprint Next Planner",
  "Sprint Recommendation",
  "getSprintNextPreview"
)

$requiredChat = @(
  "SprintNextPreviewPanel",
  "CapabilityPlannerPreviewPanel",
  "./sprint-next-panel",
  "./capability-planner-panel"
)

$missing = @()

foreach ($needle in $requiredCapability) {
  if ($capability -notlike "*$needle*") {
    $missing += "Missing in capability planner panel: $needle"
  }
}

foreach ($needle in $requiredSprint) {
  if ($sprint -notlike "*$needle*") {
    $missing += "Missing in sprint next panel: $needle"
  }
}

foreach ($needle in $requiredChat) {
  if ($chat -notlike "*$needle*") {
    $missing += "Missing in chat master panels: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Owner console planner panel structure guard failed"
}

Write-Host "OWNER CONSOLE PLANNER PANEL STRUCTURE GUARD PASSED"

