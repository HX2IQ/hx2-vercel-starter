param(
  [string]$FeatureName = "",
  [string]$Message = "",
  [string]$ProbeUrl = "https://optinodeiq.com",
  [switch]$LocalOnly,
  [switch]$AllowNoCommit
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST SAFE SPRINT =="

if ($FeatureName -ne "") {
  Write-Host ""
  Write-Host "== DEV2 FEATURE COMPILER =="
  powershell -ExecutionPolicy Bypass -File ".\tools\dev2-feature-compiler.ps1" -FeatureName $FeatureName
}

Write-Host ""
Write-Host "== PHASE 3B CLOSURE =="
if ($LocalOnly) {
  powershell -ExecutionPolicy Bypass -File ".\tools\sprint-next\phase3b-sprint-closure.ps1" -ProbeUrl $ProbeUrl -SkipDeploy
  Write-Host ""
  Write-Host "PHASE 3B FAST SAFE SPRINT PASSED - LOCAL ONLY"
  exit 0
}

if ($Message -eq "" -and -not $AllowNoCommit) {
  throw "Commit message required. Use -Message `"your message`" or -AllowNoCommit."
}

Write-Host ""
Write-Host "== GIT STATUS BEFORE COMMIT =="
git status --short

$Changes = git status --short

if ($Changes) {
  if ($Message -eq "") {
    throw "Changes exist but no commit message was provided."
  }

  Write-Host ""
  Write-Host "== COMMIT CHANGES =="
  git add -A
  git commit -m $Message
} else {
  Write-Host "No local changes to commit."
}

Write-Host ""
Write-Host "== FULL DEPLOY CLOSURE =="
powershell -ExecutionPolicy Bypass -File ".\tools\sprint-next\phase3b-sprint-closure.ps1" -ProbeUrl $ProbeUrl

Write-Host ""
Write-Host "PHASE 3B FAST SAFE SPRINT PASSED"
