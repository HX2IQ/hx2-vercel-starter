$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B LATEST GUARD CACHE REPORT =="

$CacheFile = "tools/sprint-next/_cache/phase3b-guard-cache.json"

if (!(Test-Path $CacheFile)) {
  Write-Host "No guard cache found yet. Run phase3b-guard-cache-advisory.ps1 first."
  exit 0
}

$Cache = Get-Content $CacheFile -Raw | ConvertFrom-Json

Write-Host "Cache ID: $($Cache.cache_id)"
Write-Host "Generated UTC: $($Cache.generated_at_utc)"
Write-Host "Guard count: $($Cache.guard_count)"
Write-Host "Changed count: $($Cache.changed_count)"
Write-Host "Unchanged count: $($Cache.unchanged_count)"

if ($Cache.changed_count -gt 0) {
  Write-Host ""
  Write-Host "Changed guards:"
  $Cache.changed | ForEach-Object { Write-Host "- $_" }
}

Write-Host ""
Write-Host "Advisory: Cache is informational only. No validation is skipped."
