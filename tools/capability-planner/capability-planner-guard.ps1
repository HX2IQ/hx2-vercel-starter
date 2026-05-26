$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER GUARD =="

$files = @{
  lib = "app/api/hx2/_lib/capability-planner.ts"
  route = "app/api/hx2/capability-planner/route.ts"
  execution = "app/api/hx2/_lib/capability-execution.ts"
  synthesis = "app/api/hx2/_lib/capability-synthesis.ts"
  pipeline = "app/api/hx2/_lib/capability-pipeline.ts"
  complexity = "app/api/hx2/_lib/capability-complexity.ts"
  escalation = "app/api/hx2/_lib/capability-escalation.ts"
  memory = "app/api/hx2/_lib/capability-memory.ts"
  learning = "app/api/hx2/_lib/capability-learning.ts"
  memoryRoute = "app/api/hx2/capability-planner-memory/route.ts"
  sprintRecommendation = "app/api/hx2/_lib/capability-sprint-recommendation.ts"
  feedback = "app/api/hx2/_lib/capability-feedback.ts"
  buildopsSprintPlan = "app/api/hx2/_lib/capability-buildops-sprint-plan.ts"
}

foreach ($path in $files.Values) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$text = @{}
foreach ($key in $files.Keys) {
  $text[$key] = Get-Content $files[$key] -Raw
}

$checks = @{
  lib = @(
    "CapabilityPlan","CandidateNode","detectIntent","scoreNodes",
    "applyAdaptiveNodeScoring","buildPlannerLearningSignals",
    "buildops_execution","DEV2","AP2","selected_node",
    "selection_explanation","execution_results","orchestration_synthesis",
    "execution_pipeline","request_complexity","execution_mode",
    "escalation","planner_feedback","buildops_sprint_plan",
    "orchestration_summary","adaptive_score_audit","confidencePenalty",
    "governancePenalty",
  "negativeLearningPenalty",
  "negative_learning_penalty","historyWeight","stabilityBoost"
  )

  execution = @(
    "SimulatedNodeResult","simulateNodeExecution","buildops_execution",
    "DEV2","AP2","BuildOps execution plan prepared",
    "Execution orchestration support prepared"
  )

  memory = @(
    "PlannerMemoryRecord","recordPlannerExecution","getPlannerMemory",
    "plannerMemory","selected_node","execution_mode","completed_nodes",
    "success","quality_score","sprint_type","execution_risk"
  )

  learning = @(
    "buildPlannerLearningSignals","success_rate","average_quality_score",
    "node_reliability","sprint_type_frequency","execution_risk_frequency",
    "node_frequency","execution_mode_frequency"
  )

  feedback = @(
    "PlannerFeedback","evaluatePlannerFeedback","success",
    "quality_score","feedback_reason","Full orchestration success",
    "Execution quality below threshold"
  )

  buildopsSprintPlan = @(
    "BuildOpsSprintPlan","buildBuildOpsSprintPlan","sprint_type",
    "recommended_focus","risk_level","guard_strategy","execution_notes",
    "bugfix","guard_hardening","feature_expansion"
  )

  sprintRecommendation = @(
    "buildSprintRecommendation","recommendation","priority",
    "suggested_execution_mode"
  )

  route = @(
    "buildCapabilityPlan","POST","NextResponse.json","message","text","input"
  )

  memoryRoute = @(
    "getPlannerMemory","memory_count","escalation_count",
    "pipeline_execution_count","learning_signals","sprint_recommendation",
    "NextResponse.json"
  )

  synthesis = @(
    "OrchestrationSynthesis","buildOrchestrationSynthesis",
    "participating_nodes","completed_nodes","total_nodes",
    "execution_status","synthesis_summary"
  )

  pipeline = @(
    "ExecutionStep","buildExecutionPipeline","step","node","action","depends_on"
  )

  complexity = @(
    "RequestComplexity","assessRequestComplexity","single_node",
    "multi_node","pipeline","level","score","reasons"
  )

  escalation = @(
    "EscalationDecision","evaluateExecutionEscalation","escalated",
    "original_mode","final_mode","No escalation required"
  )
}

$missing = @()

foreach ($section in $checks.Keys) {
  foreach ($needle in $checks[$section]) {
    if ($text[$section] -notlike "*$needle*") {
      $missing += "Missing in ${section}: $needle"
    }
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }
  throw "Capability planner guard failed"
}

Write-Host "CAPABILITY PLANNER GUARD PASSED"


