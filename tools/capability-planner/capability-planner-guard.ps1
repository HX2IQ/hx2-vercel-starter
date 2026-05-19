$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER GUARD =="

$lib = "app/api/hx2/_lib/capability-planner.ts"
$route = "app/api/hx2/capability-planner/route.ts"

if (!(Test-Path $lib)) {
  throw "Missing capability planner lib"
}

if (!(Test-Path $route)) {
  throw "Missing capability planner route"
}

$libText = Get-Content $lib -Raw
$routeText = Get-Content $route -Raw

$requiredLib = @(
  "CandidateNode",
  "CapabilityPlan",
  "detectIntent",
  "scoreNodes",
  "selected_node",
  "candidate_nodes",
  "execution_strategy",
  "orchestration_summary",
  "health_analysis",
  "market_analysis",
  "marketing_strategy",
  "travel_planning",
  "parenting_support",
  "general_reasoning"
)

$requiredRoute = @(
  "buildCapabilityPlan",
  "POST",
  "NextResponse.json",
  "message",
  "text",
  "input"
)

$missing = @()

foreach ($needle in $requiredLib) {
  if ($libText -notlike "*$needle*") {
    $missing += "Missing in planner lib: $needle"
  }
}

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Missing in planner route: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Capability planner guard failed"
}

Write-Host "CAPABILITY PLANNER GUARD PASSED"
