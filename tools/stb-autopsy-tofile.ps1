param(
  [string]$Base = "https://optinodeiq.com",
  [string]$Vps  = "root@ap2-worker.optinodeiq.com",
  [int]$Tail    = 160,
  [string]$OutDir = "tools\_autopsy"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ")
$outFile = Join-Path $OutDir ("stb_autopsy_{0}.log" -f $stamp)

Write-Host "Writing autopsy bundle to: $outFile" -ForegroundColor Cyan

# Capture console output to file while still showing it
& {
  .\tools\stb-autopsy.ps1 -Base $Base -Vps $Vps -Tail $Tail
} 2>&1 | Tee-Object -FilePath $outFile

Write-Host "`nDONE. Attach/paste this file for postmortems: $outFile" -ForegroundColor Green
