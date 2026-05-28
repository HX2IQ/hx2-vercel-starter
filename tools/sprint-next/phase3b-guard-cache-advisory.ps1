$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B GUARD CACHE ADVISORY =="

$CacheDir = "tools/sprint-next/_cache"
$CacheFile = Join-Path $CacheDir "phase3b-guard-cache.json"
New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null

$GuardFiles = Get-ChildItem "tools/sprint-next" -Filter "*guard.ps1" -File |
  Sort-Object FullName

$Current = @()

foreach ($Guard in $GuardFiles) {
  $Hash = Get-FileHash $Guard.FullName -Algorithm SHA256

  $Current += [ordered]@{
    path = $Guard.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    hash = $Hash.Hash
  }
}

$Changed = @()
$Unchanged = @()

if (Test-Path $CacheFile) {
  $Previous = Get-Content $CacheFile -Raw | ConvertFrom-Json

  foreach ($Item in $Current) {
    $Prior = $Previous.guards | Where-Object { $_.path -eq $Item.path } | Select-Object -First 1

    if ($null -eq $Prior -or $Prior.hash -ne $Item.hash) {
      $Changed += $Item.path
    } else {
      $Unchanged += $Item.path
    }
  }
} else {
  $Changed = @($Current | ForEach-Object { $_.path })
}

$Cache = [ordered]@{
  cache_id = "phase3b-guard-cache-advisory"
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  guard_count = $Current.Count
  changed_count = $Changed.Count
  unchanged_count = $Unchanged.Count
  changed = $Changed
  unchanged = $Unchanged
  guards = $Current
}

$Cache | ConvertTo-Json -Depth 10 | Set-Content $CacheFile -Encoding UTF8

Write-Host "Guard count: $($Current.Count)"
Write-Host "Changed guard count: $($Changed.Count)"
Write-Host "Unchanged guard count: $($Unchanged.Count)"
Write-Host "Cache written: $CacheFile"

if ($Changed.Count -gt 0) {
  Write-Host "ADVISORY: Guard files changed since last cache snapshot."
} else {
  Write-Host "ADVISORY: Guard files unchanged since last cache snapshot."
}
