$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT LOCAL CONTRACT TEST =="

$route = "app/api/hx2/sprint-next/route.ts"
$planner = "app/api/hx2/_lib/capability-planner.ts"
$buildops = "app/api/hx2/_lib/capability-buildops-sprint-plan.ts"
$action = "app/api/hx2/_lib/sprint-next-action.ts"
$riskGate = "app/api/hx2/_lib/sprint-next-risk-gate.ts"
$riskGateActions = "app/api/hx2/_lib/sprint-risk-gate-actions.ts"

foreach ($path in @($route, $planner, $buildops, $action, $riskGate, $riskGateActions)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$routeText = Get-Content $route -Raw
$plannerText = Get-Content $planner -Raw
$buildopsText = Get-Content $buildops -Raw
$actionText = Get-Content $action -Raw
$riskGateText = Get-Content $riskGate -Raw
$riskGateActionsText = Get-Content $riskGateActions -Raw

$required = @(
  @{ name = "route uses planner"; ok = $routeText -like "*buildCapabilityPlan*" },
  @{ name = "route returns sprint_next"; ok = $routeText -like "*sprint_next*" },
  @{ name = "route returns planner payload"; ok = $routeText -like "*planner*" },
  @{ name = "planner detects buildops"; ok = $plannerText -like "*buildops_execution*" },
  @{ name = "planner returns buildops sprint plan"; ok = $plannerText -like "*buildops_sprint_plan*" },
  @{ name = "buildops helper supports bugfix"; ok = $buildopsText -like "*bugfix*" },
  @{ name = "buildops helper supports guard hardening"; ok = $buildopsText -like "*guard_hardening*" },
  @{ name = "buildops helper supports feature expansion"; ok = $buildopsText -like "*feature_expansion*" },
  @{ name = "sprint action helper exists"; ok = $actionText -like "*buildSprintNextAction*" },
  @{ name = "sprint action returns feature name"; ok = $actionText -like "*dev2_feature_name*" },
  @{ name = "sprint action returns next action"; ok = $actionText -like "*next_action*" },
  @{ name = "sprint action returns recommended guard"; ok = $actionText -like "*recommended_guard*" },
  @{ name = "route returns actionable sprint"; ok = $routeText -like "*actionable_sprint*" },
  @{ name = "DEV2 package has execution phases"; ok = (Get-Content "app/api/hx2/_lib/sprint-dev2-package.ts" -Raw) -like "*execution_phases*" },
  @{ name = "DEV2 package has copy-ready PowerShell"; ok = (Get-Content "app/api/hx2/_lib/sprint-dev2-package.ts" -Raw) -like "*copy_ready_powershell*" },
  @{ name = "route returns risk gate"; ok = $routeText -like "*risk_gate*" },
  @{ name = "risk gate helper exists"; ok = $riskGateText -like "*buildSprintNextRiskGate*" },
  @{ name = "risk gate supports proceed"; ok = $riskGateText -like "*proceed*" },
  @{ name = "risk gate supports guard first"; ok = $riskGateText -like "*guard_first*" },
  @{ name = "risk gate supports inspect first"; ok = $riskGateText -like "*inspect_first*" },
  @{ name = "route returns risk gate actions"; ok = $routeText -like "*risk_gate_actions*" },
  @{ name = "risk gate actions helper exists"; ok = $riskGateActionsText -like "*buildSprintRiskGateActions*" },
  @{ name = "risk gate actions returns sequence"; ok = $riskGateActionsText -like "*recommended_sequence*" }
)

$failed = @()

foreach ($check in $required) {
  if (-not $check.ok) {
    $failed += $check.name
  }
}

if ($failed.Count -gt 0) {
  foreach ($f in $failed) {
    Write-Host "- Failed: $f"
  }
  throw "Sprint next local contract test failed"
}

Write-Host "SPRINT NEXT LOCAL CONTRACT TEST PASSED"





