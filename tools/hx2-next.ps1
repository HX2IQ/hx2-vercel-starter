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
Write-Host "System clean and benchmark target met."
Write-Host "Run npm run hx2:exec:compiler"
Write-Host ""
Write-Host "DEV2 workflow:"
Write-Host "1. npm run dev2:feature-pack:index"
Write-Host "2. npm run dev2:sprint:compiler"
Write-Host "3. npm run hx2:verify:policy"
