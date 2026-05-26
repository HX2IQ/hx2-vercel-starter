$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== HX2 STATUS CENTER ==="

Write-Host ""
Write-Host "== Roadmap Gate =="
if (Test-Path ".\tools\hx2-roadmap-gate.ps1") {
  powershell -ExecutionPolicy Bypass -File ".\tools\hx2-roadmap-gate.ps1"
}

Write-Host ""
Write-Host "== Owner Memory =="
if (Test-Path ".\tools\hx2-owner-memory.ps1") {
  powershell -ExecutionPolicy Bypass -File ".\tools\hx2-owner-memory.ps1"
}

Write-Host ""
Write-Host "== Latest Benchmark =="
if (Test-Path ".\tools\hx2-last-benchmark.json") {
  $b = Get-Content ".\tools\hx2-last-benchmark.json" -Raw | ConvertFrom-Json
  $b.summary | Format-List
} else {
  Write-Host "No latest benchmark found."
}

Write-Host ""
Write-Host "== Git Status =="
git status --short
