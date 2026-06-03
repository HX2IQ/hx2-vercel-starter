$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 TOPOLOGY GUARD =="

$GitRoot = (git rev-parse --show-toplevel).Trim().ToLower().Replace("/", "\")
$Current = ((Get-Location).Path).Trim().ToLower().Replace("/", "\")

Write-Host "Current: $Current"
Write-Host "GitRoot: $GitRoot"

if ($Current -ne $GitRoot) {
  throw "Run from repo root. Current directory does not match git root."
}

$Branch = (git branch --show-current).Trim()

$AllowedPatterns = @(
  '^main$',
  '^feature/',
  '^fix/',
  '^hotfix/',
  '^release/'
)

$Allowed = $false

foreach ($Pattern in $AllowedPatterns) {
  if ($Branch -match $Pattern) {
    $Allowed = $true
    break
  }
}

if (-not $Allowed) {
  throw "Branch not allowed by DEV2 topology policy: $Branch"
}

if (!(Test-Path ".git")) {
  throw ".git directory missing"
}

if (!(Test-Path "package.json")) {
  throw "package.json missing"
}

if (!(Test-Path "app")) {
  throw "app directory missing"
}

if (!(Test-Path "app/api")) {
  throw "app/api missing"
}

Write-Host "DEV2 topology guard passed."
