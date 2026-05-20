$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT API GUARD =="

$route = "app/api/hx2/sprint-next/route.ts"
$action = "app/api/hx2/_lib/sprint-next-action.ts"

foreach ($path in @($route, $action)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$actionText = Get-Content $action -Raw

$requiredRoute = @(
  "buildCapabilityPlan",
  "buildSprintNextAction",
  "POST",
  "NextResponse.json",
  "sprint_next",
  "intent",
  "selected_node",
  "execution_mode",
  "selection_explanation",
  "buildops_sprint_plan",
  "sprint_recommendation",
  "actionable_sprint",
  "planner"
)

$requiredAction = @(
  "buildSprintNextAction",
  "SprintNextAction",
  "dev2_feature_name",
  "sprint_category",
  "next_action",
  "recommended_guard"
)

$missing = @()

foreach ($needle in $requiredRoute) {
  if ($routeText -notlike "*$needle*") {
    $missing += "Missing in route: $needle"
  }
}

foreach ($needle in $requiredAction) {
  if ($actionText -notlike "*$needle*") {
    $missing += "Missing in action helper: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($item in $missing) {
    Write-Host "- $item"
  }

  throw "Sprint next API guard failed"
}

Write-Host "SPRINT NEXT API GUARD PASSED"



