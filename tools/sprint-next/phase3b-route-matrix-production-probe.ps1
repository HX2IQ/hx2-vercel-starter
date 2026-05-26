param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B ROUTE MATRIX PRODUCTION PROBE =="

$MatrixUrl = "$BaseUrl/api/hx2/phase3b-route-matrix"
$Matrix = Invoke-RestMethod $MatrixUrl

if ($Matrix.ok -ne $true) {
  throw "Route matrix did not return ok=true"
}

if ($Matrix.matrix_mode -ne "read_only_contract") {
  throw "Route matrix mode mismatch: $($Matrix.matrix_mode)"
}

foreach ($Entry in $Matrix.routes) {
  $Url = "$BaseUrl$($Entry.route)"

  Write-Host ""
  Write-Host "== PROBE MATRIX ROUTE: $Url =="

  $Response = Invoke-RestMethod $Url

  if ($Response.route -ne $Entry.route) {
    throw "Route marker mismatch for $($Entry.route): got $($Response.route)"
  }

  $ModeValues = @(
    $Response.compiler_mode,
    $Response.dependency_mode,
    $Response.plan_mode,
    $Response.graph_mode,
    $Response.status_mode,
    $Response.release_mode,
    $Response.matrix_mode
  ) | Where-Object { $_ }

  if ($ModeValues -notcontains $Entry.expected_mode) {
    throw "Expected mode '$($Entry.expected_mode)' not found for $($Entry.route). Got: $($ModeValues -join ', ')"
  }
}

Write-Host ""
Write-Host "PHASE 3B ROUTE MATRIX PRODUCTION PROBE PASSED"

