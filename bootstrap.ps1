# bootstrap.ps1 (known-good)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$global:Vps  = "root@165.227.126.204"     # or root@ap2-worker.optinodeiq.com
$global:Base = "https://optinodeiq.com"

function Assert-Var {
  param([string]$Name)
  $v = Get-Variable -Name $Name -Scope Global -ErrorAction SilentlyContinue
  if (-not $v -or [string]::IsNullOrWhiteSpace([string]$v.Value)) {
    throw "Missing required variable: `$${Name}"
  }
}

function Run-Remote {
  param([Parameter(Mandatory)][string]$Script)
  Assert-Var Vps
  $clean = $Script -replace "`r",""
  Write-Host "`n--- RUNNING ON $($global:Vps) ---" -ForegroundColor DarkGray
  $clean | ssh -T $global:Vps "tr -d '\r' | bash -s"
}

function Remote-OK {
  $script = @'
echo "REMOTE_OK host=$(hostname)"
echo "pwd=$(pwd)"
whoami
'@
  Run-Remote $script
}

Write-Host "Local context:" -ForegroundColor Yellow
"`$Vps  = [$($global:Vps)]"
"`$Base = [$($global:Base)]"

Write-Host "`nTesting remote connectivity..." -ForegroundColor Yellow
Remote-OK

Write-Host "`n== HX2 Bootstrap complete ==" -ForegroundColor Green

