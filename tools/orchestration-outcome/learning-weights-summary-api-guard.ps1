$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== LEARNING WEIGHTS SUMMARY API GUARD =="

$route = "app/api/hx2/learning-weights-summary/route.ts"

if (!(Test-Path $route)) {
  throw "Missing learning weights summary route"
}

$text = Get-Content $route -Raw

$required = @(
  "GET",
  "NextResponse.json",
  "orchestration-learning-weights.json",
  "stability_bias",
  "expansion_bias",
  "verification_bias",
  "telemetry_bias",
  "posture",
  "stability_weighted",
  "expansion_weighted"
)

$missing = @()

foreach ($needle in $required) {
  if ($text -notlike "*$needle*") {
    $missing += "Missing: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) { Write-Host "- $m" }
  throw "Learning weights summary API guard failed"
}

Write-Host "LEARNING WEIGHTS SUMMARY API GUARD PASSED"
