$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== HX2 NEXT STRATEGIST ==="

$dirty = (git status --short)

$hasUntracked = $dirty | Select-String "^\?\?"
$hasModified = $dirty | Select-String "^\sM|^M"

if ($hasUntracked) {
  Write-Host ""
  Write-Host "NEXT MOVE:"
  Write-Host "Review untracked files. Add real assets or ignore generated files."
  exit
}

if ($hasModified) {
  Write-Host ""
  Write-Host "NEXT MOVE:"
  Write-Host "Commit current changes after quick review."
  exit
}

if (Test-Path ".\tools\hx2-last-benchmark.json") {
  $b = Get-Content ".\tools\hx2-last-benchmark.json" -Raw | ConvertFrom-Json
  $avg = [double]$b.summary.AverageScore

  if ($avg -lt 9.0) {
    Write-Host ""
    Write-Host "NEXT MOVE:"
    Write-Host "Benchmark below target. Run npm run hx2:benchmark"
    exit
  }
}

Write-Host ""
Write-Host "NEXT MOVE:"
Write-Host "System clean. Run npm run dev2:sprint:compiler to select/compile the next roadmap feature, or npm run hx2:exec for legacy executor."

