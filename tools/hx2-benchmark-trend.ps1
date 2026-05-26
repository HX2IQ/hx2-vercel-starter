$ErrorActionPreference = "Stop"

$dir = ".\tools\benchmark-history"

if (!(Test-Path $dir)) {
  throw "Benchmark history folder missing. Run hx2-benchmark-history.ps1 first."
}

$files = Get-ChildItem $dir -Filter "benchmark_*.json" | Sort-Object LastWriteTime

if ($files.Count -eq 0) {
  throw "No benchmark history files found."
}

$rows = foreach ($f in $files) {
  $data = Get-Content $f.FullName -Raw | ConvertFrom-Json

  [pscustomobject]@{
    File = $f.Name
    GeneratedUTC = $data.generated_utc
    AverageScore = [double]$data.summary.AverageScore
    Passed = [string]$data.summary.Passed
    OverallPassed = [bool]$data.summary.OverallPassed
  }
}

Write-Host ""
Write-Host "HX2 Benchmark Trend"
Write-Host "-------------------"
$rows | Format-Table -AutoSize

$best = $rows | Sort-Object AverageScore -Descending | Select-Object -First 1
$latest = $rows | Select-Object -Last 1
$avg = [Math]::Round((($rows | Measure-Object -Property AverageScore -Average).Average), 2)

Write-Host ""
Write-Host "Summary"
Write-Host "-------"
Write-Host "Runs: $($rows.Count)"
Write-Host "Average of runs: $avg"
Write-Host "Best score: $($best.AverageScore) from $($best.File)"
Write-Host "Latest score: $($latest.AverageScore)"
