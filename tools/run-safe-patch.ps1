param(
  [Parameter(Mandatory=$true)]
  [string] $PatchFile
)

$ErrorActionPreference = "Stop"

# Always run from repo root (parent of /tools)
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $RepoRoot

if (!(Test-Path -LiteralPath $PatchFile)) { throw "Missing patch: $PatchFile" }

Write-Host "RUN: $PatchFile" -ForegroundColor Cyan
pwsh -NoProfile -ExecutionPolicy Bypass -File $PatchFile
if ($LASTEXITCODE -ne 0) { throw "Patch failed: $PatchFile" }

Write-Host "OK: Patch applied." -ForegroundColor Green