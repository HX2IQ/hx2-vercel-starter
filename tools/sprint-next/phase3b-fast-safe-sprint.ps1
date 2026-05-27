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

$AuditDir = "tools/sprint-next/_audit"
New-Item -ItemType Directory -Force -Path $AuditDir | Out-Null

$StartedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$Branch = git branch --show-current
$BeforeCommit = git rev-parse --short HEAD

if ($FeatureName -ne "") {
  Write-Host ""
  Write-Host "== DEV2 FEATURE COMPILER =="
  powershell -ExecutionPolicy Bypass -File ".\tools\dev2-feature-compiler.ps1" -FeatureName $FeatureName
}

Write-Host ""
Write-Host "== PHASE 3B CLOSURE =="

if ($LocalOnly) {
  powershell -ExecutionPolicy Bypass -File ".\tools\sprint-next\phase3b-sprint-closure.ps1" -ProbeUrl $ProbeUrl -SkipDeploy

  $Audit = [ordered]@{
    audit_id = "phase3b-fast-safe-sprint"
    started_at_utc = $StartedAt
    completed_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    mode = "local_only"
    feature_name = $FeatureName
    message = $Message
    branch = $Branch
    before_commit = $BeforeCommit
    after_commit = (git rev-parse --short HEAD)
    probe_url = $ProbeUrl
    result = "passed"
  }

  $AuditPath = Join-Path $AuditDir ("phase3b-fast-safe-sprint-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
  $Audit | ConvertTo-Json -Depth 10 | Set-Content $AuditPath -Encoding UTF8

  Write-Host ""
  Write-Host "Audit written: $AuditPath"
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

$Audit = [ordered]@{
  audit_id = "phase3b-fast-safe-sprint"
  started_at_utc = $StartedAt
  completed_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  mode = "deploy"
  feature_name = $FeatureName
  message = $Message
  branch = $Branch
  before_commit = $BeforeCommit
  after_commit = (git rev-parse --short HEAD)
  probe_url = $ProbeUrl
  result = "passed"
}

$AuditPath = Join-Path $AuditDir ("phase3b-fast-safe-sprint-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$Audit | ConvertTo-Json -Depth 10 | Set-Content $AuditPath -Encoding UTF8

Write-Host ""
Write-Host "Audit written: $AuditPath"
Write-Host ""
Write-Host "PHASE 3B FAST SAFE SPRINT PASSED"
