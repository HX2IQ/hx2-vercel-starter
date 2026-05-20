$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT API GUARD =="

$route = "app/api/hx2/sprint-next/route.ts"

if (!(Test-Path $route)) {
  throw "Missing sprint-next API route"
}

$text = Get-Content $route -Raw

$required = @(
  "buildCapabilityPlan",
  "POST",
  "NextResponse.json",
  "sprint_next",
  "intent",
  "selected_node",
  "execution_mode",
  "selection_explanation",
  "buildops_sprint_plan",
  "sprint_recommendation",
  "planner"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += $needle
  }
}

if ($missing.Count -gt 0) {
  foreach ($item in $missing) {
    Write-Host "- Missing: $item"
  }

  throw "Sprint next API guard failed"
}

Write-Host "SPRINT NEXT API GUARD PASSED"
