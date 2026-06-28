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

Write-Host ""
Write-Host "== DEV2 Sprint Compiler Workflow =="
if (Test-Path ".\tools\dev2-feature-pack-index.ps1") {
  Write-Host "GREEN: dev2-feature-pack-index.ps1"
} else {
  Write-Host "RED: missing dev2-feature-pack-index.ps1"
}

if (Test-Path ".\tools\dev2-sprint-compiler-workflow.ps1") {
  Write-Host "GREEN: dev2-sprint-compiler-workflow.ps1"
} else {
  Write-Host "RED: missing dev2-sprint-compiler-workflow.ps1"
}

Write-Host "Next command: npm run hx2:exec:compiler"
