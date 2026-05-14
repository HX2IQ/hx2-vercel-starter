$ErrorActionPreference = "Stop"

Write-Host "Running HX2 benchmark regression guard..."

powershell -ExecutionPolicy Bypass -File ".\tools\hx2-intel-smoke.ps1"

$File = ".\tools\hx2-last-benchmark.json"

if (!(Test-Path $File)) {
  throw "Benchmark output missing: $File"
}

$data = Get-Content $File -Raw | ConvertFrom-Json

$avg = [double]$data.summary.AverageScore
$passed = [string]$data.summary.Passed
$overall = [bool]$data.summary.OverallPassed

$total = @($data.results).Count
$passedCount = @($data.results | Where-Object { $_.Passed -eq $true }).Count
$expectedPassed = "$passedCount/$total"

Write-Host ""
Write-Host "Benchmark Guard Result"
Write-Host "AverageScore: $avg"
Write-Host "Passed: $passed"
Write-Host "OverallPassed: $overall"
Write-Host "ComputedPassed: $expectedPassed"

if ($avg -lt 9.0) {
  throw "Benchmark regression: AverageScore below 9.0"
}

if ($passedCount -ne $total) {
  throw "Benchmark regression: not all tests passed"
}

if ($passed -ne "$total/$total") {
  throw "Benchmark regression: summary passed count does not match actual total"
}

if ($overall -ne $true) {
  throw "Benchmark regression: OverallPassed is false"
}

Write-Host "Benchmark guard passed."
