$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== CAPABILITY PLANNER GUARD =="

$lib = "app/api/hx2/_lib/capability-planner.ts"
$route = "app/api/hx2/capability-planner/route.ts"
$execution = "app/api/hx2/_lib/capability-execution.ts"
$synthesis = "app/api/hx2/_lib/capability-synthesis.ts"
$pipeline = "app/api/hx2/_lib/capability-pipeline.ts"
$complexity = "app/api/hx2/_lib/capability-complexity.ts"
$escalation = "app/api/hx2/_lib/capability-escalation.ts"
$memory = "app/api/hx2/_lib/capability-memory.ts"
$memoryRoute = "app/api/hx2/capability-planner-memory/route.ts"
$sprintRecommendation = "app/api/hx2/_lib/capability-sprint-recommendation.ts"
$feedback = "app/api/hx2/_lib/capability-feedback.ts"
$buildopsSprintPlan = "app/api/hx2/_lib/capability-buildops-sprint-plan.ts"

$paths = @($lib, $route, $execution, $synthesis, $pipeline, $complexity, $escalation, $memory, $memoryRoute, $sprintRecommendation, $feedback, $buildopsSprintPlan)

foreach ($path in $paths) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$libText = Get-Content $lib -Raw
$routeText = Get-Content $route -Raw
$executionText = Get-Content $execution -Raw
$synthesisText = Get-Content $synthesis -Raw
$pipelineText = Get-Content $pipeline -Raw
$complexityText = Get-Content $complexity -Raw
$escalationText = Get-Content $escalation -Raw
$memoryText = Get-Content $memory -Raw
$memoryRouteText = Get-Content $memoryRoute -Raw
$sprintRecommendationText = Get-Content $sprintRecommendation -Raw
$feedbackText = Get-Content $feedback -Raw
$buildopsSprintPlanText = Get-Content $buildopsSprintPlan -Raw

$requiredLib = @(
  "CandidateNode",
  "CapabilityPlan",
  "detectIntent",
  "scoreNodes",
  "applyAdaptiveNodeScoring",
  "buildPlannerLearningSignals",
  "usageBoost",
  "nodeReliability",
  "qualityBoost",
  "successBoost",
  "historyWeight",
  "stabilityBoost",
  "adaptive_score_audit",
  "confidencePenalty",
  "governancePenalty",
  "confidence_penalty",
  "governance_penalty",
  "total_boost",
  "buildSelectionExplanation",
  "selected_node",
  "selection_explanation",
  "candidate_nodes",
  "execution_strategy",
  "execution_results",
  "orchestration_synthesis",
  "execution_pipeline",
  "request_complexity",
  "execution_mode",
  "escalation",
  "orchestration_summary",
  "simulateNodeExecution",
  "buildops_execution",
  "DEV2",
  "AP2",
  "DEV2 build planning and execution orchestration",
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

$requiredExecution = @(
  "SimulatedNodeResult",
  "simulateNodeExecution",
  "buildops_execution",
  "DEV2",
  "AP2",
  "BuildOps execution plan prepared",
  "Execution orchestration support prepared",
  "health_analysis",
  "market_analysis",
  "marketing_strategy",
  "travel_planning",
  "parenting_support",
  "complete",
  "summary"
)

$requiredSynthesis = @(
  "OrchestrationSynthesis",
  "buildOrchestrationSynthesis",
  "participating_nodes",
  "completed_nodes",
  "total_nodes",
  "execution_status",
  "synthesis_summary"
)

$requiredPipeline = @(
  "ExecutionStep",
  "buildExecutionPipeline",
  "step",
  "node",
  "action",
  "depends_on"
)

$requiredComplexity = @(
  "RequestComplexity",
  "assessRequestComplexity",
  "execution_mode",
  "single_node",
  "multi_node",
  "pipeline",
  "level",
  "score",
  "reasons"
)

$requiredEscalation = @(
  "EscalationDecision",
  "evaluateExecutionEscalation",
  "escalated",
  "original_mode",
  "final_mode",
  "reason",
  "No escalation required"
)

$requiredMemory = @(
  "PlannerMemoryRecord",
  "recordPlannerExecution",
  "getPlannerMemory",
  "plannerMemory",
  "execution_mode",
  "selected_node",
  "completed_nodes",
  "success",
  "quality_score",
  "sprint_type",
  "execution_risk"
)

$requiredMemoryRoute = @(
  "getPlannerMemory",
  "memory_count",
  "escalation_count",
  "pipeline_execution_count",
  "sprint_recommendation",
  "NextResponse.json"
)

$requiredSprintRecommendation = @(
  "buildSprintRecommendation",
  "recommendation",
  "priority",
  "suggested_execution_mode",
  "Expand orchestration pipeline coverage",
  "Improve confidence scoring and node arbitration",
  "Expand planner intelligence capabilities"
)

$requiredFeedback = @(
  "PlannerFeedback",
  "evaluatePlannerFeedback",
  "success",
  "quality_score",
  "sprint_type",
  "execution_risk",
  "feedback_reason",
  "Full orchestration success",
  "Execution quality below threshold"
)

$requiredBuildOpsSprintPlan = @(
  "BuildOpsSprintPlan",
  "buildBuildOpsSprintPlan",
  "sprint_type",
  "recommended_focus",
  "risk_level",
  "guard_strategy",
  "execution_notes",
  "bugfix",
  "guard_hardening",
  "feature_expansion",
  "Repair failing contract before feature expansion",
  "Add isolated capability module before UI integration"
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

foreach ($needle in $requiredExecution) {
  if ($executionText -notlike "*$needle*") {
    $missing += "Missing in execution lib: $needle"
  }
}

foreach ($needle in $requiredSynthesis) {
  if ($synthesisText -notlike "*$needle*") {
    $missing += "Missing in synthesis lib: $needle"
  }
}

foreach ($needle in $requiredPipeline) {
  if ($pipelineText -notlike "*$needle*") {
    $missing += "Missing in pipeline lib: $needle"
  }
}

foreach ($needle in $requiredComplexity) {
  if ($complexityText -notlike "*$needle*") {
    $missing += "Missing in complexity lib: $needle"
  }
}

foreach ($needle in $requiredEscalation) {
  if ($escalationText -notlike "*$needle*") {
    $missing += "Missing in escalation lib: $needle"
  }
}

foreach ($needle in $requiredMemory) {
  if ($memoryText -notlike "*$needle*") {
    $missing += "Missing in memory lib: $needle"
  }
}

foreach ($needle in $requiredMemoryRoute) {
  if ($memoryRouteText -notlike "*$needle*") {
    $missing += "Missing in memory route: $needle"
  }
}

foreach ($needle in $requiredSprintRecommendation) {
  if ($sprintRecommendationText -notlike "*$needle*") {
    $missing += "Missing in sprint recommendation lib: $needle"
  }
}

foreach ($needle in $requiredFeedback) {
  if ($feedbackText -notlike "*$needle*") {
    $missing += "Missing in feedback lib: $needle"
  }
}

foreach ($needle in $requiredBuildOpsSprintPlan) {
  if ($buildopsSprintPlanText -notlike "*$needle*") {
    $missing += "Missing in buildops sprint plan lib: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Capability planner guard failed"
}

Write-Host "CAPABILITY PLANNER GUARD PASSED"












