$ErrorActionPreference = "Stop"

$Base = if ($env:HX2_BASE_URL) { $env:HX2_BASE_URL } else { "https://optinodeiq.com" }
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Write-Host ""
Write-Host "== HX2 production version proof ==" -ForegroundColor Cyan

try {
  $version = Invoke-RestMethod "$Base/api/version?ts=$ts" -TimeoutSec 30
  $version | ConvertTo-Json -Depth 10
}
catch {
  throw "Failed to read production version endpoint: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Production version endpoint responded." -ForegroundColor Green

