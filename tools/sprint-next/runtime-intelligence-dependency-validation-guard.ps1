Write-Host "`n== RUNTIME INTELLIGENCE DEPENDENCY VALIDATION GUARD =="

$route = ".\app\api\hx2\runtime-intelligence-dependency-validation\route.ts"

if (!(Test-Path $route)) {
  throw "Missing dependency validation route"
}

$content = Get-Content $route -Raw

$required = @(
  "dependency_validation",
  "missing_dependencies",
  "duplicate_nodes",
  "dependency_count",
  "node_count",
  "read_only_dependency_validation"
)

$missing = @()

foreach ($item in $required) {
  if ($content -notmatch [regex]::Escape($item)) {
    $missing += $item
  }
}

if ($missing.Count -gt 0) {
  Write-Host "DEPENDENCY VALIDATION GUARD FAILED"
  foreach ($m in $missing) {
    Write-Host "- Missing: $m"
  }
  throw "Dependency validation route contract incomplete"
}

Write-Host "Runtime intelligence dependency validation local contract: PASS"
