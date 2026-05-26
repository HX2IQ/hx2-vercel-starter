$ErrorActionPreference = "Stop"
Write-Host "== tools present ==" -ForegroundColor Cyan
Get-ChildItem .\tools\*.ps1 | Sort-Object Name | Select-Object Name,Length,LastWriteTime | Format-Table -AutoSize

Write-Host "`n== quick run instructions ==" -ForegroundColor Cyan
Write-Host @"
Run:
  .\tools\stb-autopsy.ps1
Or:
  .\tools\stb-autopsy.ps1 -Base https://optinodeiq.com -Vps root@ap2-worker.optinodeiq.com
"@
