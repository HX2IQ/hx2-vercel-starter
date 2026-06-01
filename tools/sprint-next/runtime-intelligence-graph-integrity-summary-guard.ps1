Write-Host "`n== RUNTIME INTELLIGENCE GRAPH INTEGRITY SUMMARY GUARD =="

$route = ".\app\api\hx2\runtime-intelligence-graph-integrity-summary\route.ts"

if (!(Test-Path $route)) {
  throw "Missing graph integrity summary route"
}

$content = Get-Content $route -Raw

$required = @(
  "graph_integrity_summary",
  "graph_valid",
  "acyclic",
  "dependency_safe",
  "orphan_safe",
  "ready_for_arbitration_planning",
  "read_only_graph_integrity_summary"
)

$missing = @()

foreach ($item in $required) {
  if ($content -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "GRAPH INTEGRITY SUMMARY GUARD FAILED"
  foreach ($m in $missing) {
    Write-Host "- Missing: $m"
  }
  throw "Graph integrity summary contract incomplete"
}

Write-Host "Runtime intelligence graph integrity summary local contract: PASS"
