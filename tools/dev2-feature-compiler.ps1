param(
  [Parameter(Mandatory=$true)]
  [string]$FeatureName
)

$ErrorActionPreference = "Stop"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeName = ($FeatureName -replace '[^a-zA-Z0-9_-]', '-').ToLower()
$RunDir = "tools\dev2\runs\$stamp-$safeName"

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

Write-Host ""
Write-Host "DEV2 FEATURE COMPILER" -ForegroundColor Cyan
Write-Host "Feature: $FeatureName"
Write-Host "RunDir: $RunDir"

Write-Host ""
Write-Host "== Regression snapshot ==" -ForegroundColor Cyan

$SnapshotDir = Join-Path $RunDir "snapshots"
New-Item -ItemType Directory -Force -Path $SnapshotDir | Out-Null

try {
  powershell -ExecutionPolicy Bypass -File .\tools\hx2-benchmark-guard.ps1 *> "$SnapshotDir\benchmark-before.txt"
}
catch {
  $_ | Out-File "$SnapshotDir\benchmark-before.txt"
}

try {
  powershell -ExecutionPolicy Bypass -File .\tools\smoke-hx2-router-v2.ps1 *> "$SnapshotDir\router-before.txt"
}
catch {
  $_ | Out-File "$SnapshotDir\router-before.txt"
}

try {
  npm run build *> "$SnapshotDir\build-before.txt"
}
catch {
  $_ | Out-File "$SnapshotDir\build-before.txt"
}
Write-Host "== Snapshot git state ==" -ForegroundColor Cyan
$statusBefore = git status --short
$statusBefore | Tee-Object "$RunDir\git-status-before.txt"

if ($statusBefore -match "^\?\? tools\\dev2\\runs\\") {
  Write-Host "INFO: DEV2 run logs are ignored/generated." -ForegroundColor Yellow
}

if ($statusBefore -match "^\?\? " -and $statusBefore -notmatch "^\?\? tools\\dev2\\runs\\") {
  Write-Warning "Untracked files detected outside DEV2 run logs. Review before deploy."
}

Write-Host ""
Write-Host "== Build ==" -ForegroundColor Cyan
npm run build 2>&1 | Tee-Object "$RunDir\build.log"
if ($LASTEXITCODE -ne 0) { throw "DEV2 compiler failed: build failed" }

Write-Host ""
Write-Host "== Smoke: chat-master ==" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\tools\smoke-hx2-chat-master.ps1 2>&1 | Tee-Object "$RunDir\smoke-chat-master.log"
if ($LASTEXITCODE -ne 0) { throw "DEV2 compiler failed: chat-master smoke failed" }

Write-Host ""
Write-Host "== Smoke: production ==" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\tools\smoke-hx2-production.ps1 2>&1 | Tee-Object "$RunDir\smoke-production.log"
if ($LASTEXITCODE -ne 0) { throw "DEV2 compiler failed: production smoke failed" }

Write-Host ""
Write-Host "== Benchmark guard ==" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\tools\hx2-benchmark-guard.ps1 2>&1 | Tee-Object "$RunDir\benchmark.log"
if ($LASTEXITCODE -ne 0) { throw "DEV2 compiler failed: benchmark guard failed" }

Write-Host ""
Write-Host "== Final git state ==" -ForegroundColor Cyan
git status --short | Tee-Object "$RunDir\git-status-after.txt"

@{
  ok = $true
  feature = $FeatureName
  run_dir = $RunDir
  completed_at = (Get-Date).ToString("o")
  next = "Review git status, commit verified changes, then ship."
} | ConvertTo-Json -Depth 10 | Set-Content "$RunDir\result.json" -Encoding UTF8

Write-Host ""
Write-Host "DEV2 COMPILER PASSED" -ForegroundColor Green
Write-Host "Logs: $RunDir"

Write-Host ""
Write-Host "== Deploy Readiness ==" -ForegroundColor Cyan

$finalStatus = git status --short

if (!$finalStatus) {
  Write-Host "Clean tree: ready to deploy." -ForegroundColor Green
} else {
  Write-Host "Pending changes detected:" -ForegroundColor Yellow
  $finalStatus
  Write-Host ""
  Write-Host "Next recommended commands:" -ForegroundColor Yellow
Write-Host "git status --short"
Write-Host "git add <changed-files>"
Write-Host "git commit -m `"Describe verified DEV2 change`""
Write-Host "npm run hx2:ship"
}





