$ErrorActionPreference = "Stop"

$BootstrapFile = "tools\bootstrap\hx2-node-os-v1.txt"

if (!(Test-Path $BootstrapFile)) {
  throw "Bootstrap file not found: $BootstrapFile"
}

$content = Get-Content $BootstrapFile -Raw

if (-not (Get-Command Set-Clipboard -ErrorAction SilentlyContinue)) {
  throw "Set-Clipboard not available. Use PowerShell 5+ or 7+."
}

$content | Set-Clipboard

Write-Host ""
Write-Host "HX2 bootstrap copied to clipboard." -ForegroundColor Green
Write-Host "Paste it into a new chat to resume Node OS." -ForegroundColor Cyan
