param(
  [int]$Count = 3,
  [switch]$Content
)

$ErrorActionPreference = "Stop"

$VerifyRunDir = Join-Path $PSScriptRoot "_verify-runs"

if (-not (Test-Path $VerifyRunDir)) {
  Write-Host "No verify run log directory found: $VerifyRunDir" -ForegroundColor Yellow
  exit 0
}

$Logs =
  Get-ChildItem $VerifyRunDir -Filter "*.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First $Count

if (-not $Logs -or @($Logs).Count -eq 0) {
  Write-Host "No verify run logs found." -ForegroundColor Yellow
  exit 0
}

Write-Host ""
Write-Host ("LATEST HX2 VERIFY LOGS: top {0}" -f $Count) -ForegroundColor Cyan

$Logs |
  Select-Object LastWriteTime, Length, Name |
  Format-Table -AutoSize

if ($Content) {
  Write-Host ""
  Write-Host "LATEST VERIFY LOG CONTENT" -ForegroundColor Cyan
  Write-Host ("File: {0}" -f $Logs[0].FullName)
  Write-Host ""
  Get-Content $Logs[0].FullName
}
