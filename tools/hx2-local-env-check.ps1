$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 LOCAL ENV QUICK CHECK ==" -ForegroundColor Cyan

$checks = @{
  "UPSTASH_REDIS_REST_URL or KV_REST_API_URL" = [bool]($env:UPSTASH_REDIS_REST_URL -or $env:KV_REST_API_URL)
  "UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN" = [bool]($env:UPSTASH_REDIS_REST_TOKEN -or $env:KV_REST_API_TOKEN)
  "AP2_GATEWAY_URL" = [bool]$env:AP2_GATEWAY_URL
  "DATABASE_URL" = [bool]$env:DATABASE_URL
  "OPENAI_API_KEY" = [bool]$env:OPENAI_API_KEY
}

foreach ($k in $checks.Keys) {
  if ($checks[$k]) {
    Write-Host "PASS  $k" -ForegroundColor Green
  } else {
    Write-Host "WARN  $k missing" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "No secret values displayed." -ForegroundColor Cyan
