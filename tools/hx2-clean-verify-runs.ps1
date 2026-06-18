param(
  [int]$Keep = 50
)

$ErrorActionPreference = "Stop"

if ($Keep -lt 1) {
  throw "Keep must be at least 1."
}

$VerifyRunDir = Join-Path $PSScriptRoot "_verify-runs"

if (-not (Test-Path $VerifyRunDir)) {
  Write-Host "No verify run log directory found: $VerifyRunDir" -ForegroundColor Yellow
  exit 0
}

$Logs =
  Get-ChildItem $VerifyRunDir -Filter "*.log" |
    Sort-Object LastWriteTime -Descending

$Total = @($Logs).Count
$ToDelete = @($Logs | Select-Object -Skip $Keep)

Write-Host ""
Write-Host "HX2 VERIFY LOG CLEANUP" -ForegroundColor Cyan
Write-Host ("Current logs: {0}" -f $Total)
Write-Host ("Keeping newest: {0}" -f $Keep)
Write-Host ("Deleting: {0}" -f @($ToDelete).Count)

foreach ($Log in $ToDelete) {
  Remove-Item $Log.FullName -Force
  Write-Host ("Deleted: {0}" -f $Log.Name)
}

Write-Host "GREEN: verify log cleanup complete" -ForegroundColor Green
