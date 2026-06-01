Write-Host "`n== RUNTIME INTELLIGENCE EXECUTION READINESS GUARD =="

$route = ".\app\api\hx2\runtime-intelligence-execution-readiness\route.ts"

if (!(Test-Path $route)) {
  throw "Missing execution readiness route"
}

$content = Get-Content $route -Raw

$required = @(
  "execution_readiness",
  "arbitration_ready",
  "planning_ready",
  "execution_ready",
  "blockers",
  "readiness_tier",
  "ready_for_orchestration_planning"
)

foreach ($item in $required) {
  if ($content -notmatch [regex]::Escape($item)) {
    throw "Execution readiness route missing required term: $item"
  }
}

Write-Host "Runtime intelligence execution readiness local contract: PASS"
