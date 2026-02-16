param(
  [string]$Base = "https://patch.optinodeiq.com",
  [ValidateSet("fast","full")] [string]$Mode = "full",
  [ValidateSet("recent","relevance")] [string]$RankMode = "recent",
  [int]$TimeoutMs = $(if ($Mode -eq "fast") { 6000 } else { 12000 })
)

$ErrorActionPreference = "Stop"
$IsFast = ($Mode -eq "fast")

# Defaults: fast tests only BBC; full tests Tier-1 set
$DefaultIdsFast = @("bbc_top")
$DefaultIdsFull = @("bbc_top","consortium","grayzone","mintpress")
$DefaultIds     = $(if ($IsFast) { $DefaultIdsFast } else { $DefaultIdsFull })

function New-Ts { [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }

# Strong list type (avoids op_Addition / array weirdness)
$steps = New-Object System.Collections.Generic.List[object]
function Add-Step([string]$name, [bool]$ok, [string]$detail) {
  $steps.Add([pscustomobject]@{ step=$name; ok=$ok; detail=$detail }) | Out-Null
}

$commit = $null

Write-Host "`n=== REGRESSION ($Mode) ===" -ForegroundColor Cyan
Write-Host ("Base={0}  RankMode={1}  TimeoutMs={2}  Feeds={3}" -f $Base,$RankMode,$TimeoutMs,($DefaultIds -join ",")) -ForegroundColor Gray

# ========= 1) VERSION =========
try {
  $ts = New-Ts
  $v  = Invoke-RestMethod "$Base/api/version?ts=$ts" -Method Get
  if (-not $v.ok) { throw "ok=false" }
  $commit = $v.vercel.git_commit_sha
  Add-Step "version" $true ("sha=" + $commit)
} catch {
  Add-Step "version" $false $_.Exception.Message
  throw
}

# ========= 2) RSS KNOWN (CATALOG + FETCH) =========
try {
  $ts = New-Ts
  $k  = Invoke-RestMethod "$Base/api/rss/known?ts=$ts" -Method Get
  if (-not $k.ok) { throw "ok=false" }

  $ids = @($k.feeds | ForEach-Object { $_.id })
  foreach ($need in $DefaultIds) {
    if ($ids -notcontains $need) { throw "missing feed id '$need' in rss/known" }
  }

  $ts = New-Ts
  $kf = Invoke-RestMethod "$Base/api/rss/known?ts=$ts" -Method Post -ContentType "application/json" `
    -Body (@{ ids=$DefaultIds; n=5; timeout_ms=$TimeoutMs } | ConvertTo-Json -Depth 10)

  if (-not $kf.ok) { throw "ok=false" }

  $wanted = @($DefaultIds)

  # Some implementations may return a superset of feeds; enforce correctness against the requested ids only.
  $got = @($kf.feeds | Where-Object { $wanted -contains $_.id })
  $gotIds = @($got | ForEach-Object { $_.id })

  $missing = @($wanted | Where-Object { $gotIds -notcontains $_ })
  if ($missing.Count -gt 0) { throw "missing feeds in fetch: $($missing -join ',')" }

  $okFeeds = @($got | Where-Object { $_.ok -eq $true }).Count
  if ($okFeeds -ne $wanted.Count) { throw "feeds_ok=$okFeeds expected=$($wanted.Count)" }

  Add-Step "rss_known_fetch" $true ("feeds_ok=" + $okFeeds)
} catch {
  Add-Step "rss_known_fetch" $false $_.Exception.Message
  throw
}

# ========= 3) RSS SCAN (CONTRACT + RANK_MODE) =========
try {
  $ts = New-Ts
  $r  = Invoke-RestMethod "$Base/api/rss/scan?ts=$ts" -Method Post -ContentType "application/json" `
    -Headers @{ "x-hx2-session"="reg-rss"; "cache-control"="no-cache" } `
    -Body (@{
      q="Nigeria villages residents say"
      ids=$DefaultIds
      n_items_per_feed=25
      max_matches=20
      timeout_ms=$TimeoutMs
      rank_mode=$RankMode
    } | ConvertTo-Json -Depth 10)

  if (-not $r.ok) { throw "ok=false error=$($r.error)" }
  if (-not ($r.PSObject.Properties.Name -contains "rank_mode")) { throw "missing rank_mode" }
  if ([string]::IsNullOrWhiteSpace([string]$r.rank_mode)) { throw "rank_mode empty" }
  if ($r.rank_mode -ne $RankMode) { throw "rank_mode mismatch expected='$RankMode' actual='$($r.rank_mode)'" }
  if ($r.feeds_n -lt 1) { throw "feeds_n invalid" }

  Add-Step "rss_scan" $true ("feeds_n=$($r.feeds_n) scanned=$($r.scanned_items_n) matches=$($r.matches_n) rank=$($r.rank_mode)")
} catch {
  Add-Step "rss_scan" $false $_.Exception.Message
  throw
}

# ========= 4) CHAT WEB SOURCES (FULL ONLY) =========
if (-not $IsFast) {
  try {
    $ts = New-Ts
    $c  = Invoke-RestMethod "$Base/api/chat/send?ts=$ts" -Method Post -ContentType "application/json" `
      -Headers @{ "x-hx2-session"="reg-web"; "cache-control"="no-cache" } `
      -Body (@{ message="Use web: Super Bowl winner. Cite sources." } | ConvertTo-Json -Depth 10)

    $src = $null
    if ($c.sources) { $src = $c.sources }
    elseif ($c.data -and $c.data.sources) { $src = $c.data.sources }

    $n = 0
    if ($src) { $n = @($src).Count }
    if ($n -lt 1) { throw "sources_n=$n" }
    if ([string]::IsNullOrWhiteSpace([string]$src[0].url)) { throw "first source url empty" }

    Add-Step "chat_web_sources" $true ("sources_n=$n first=" + $src[0].url)
  } catch {
    Add-Step "chat_web_sources" $false $_.Exception.Message
    throw
  }
} else {
  Add-Step "chat_web_sources" $true "skipped (fast mode)"
}

# ========= SUMMARY =========
Write-Host "`n=== SUMMARY ===`n" -ForegroundColor Cyan
$steps | Format-Table step,ok,detail -AutoSize

if (@($steps | Where-Object { $_.ok -eq $false }).Count -gt 0) {
  Write-Host "`nREGRESSION FAILED ❌`n" -ForegroundColor Red
  exit 1
}

Write-Host "`nALL PASS ✅`n" -ForegroundColor Green

[pscustomobject]@{
  ok      = $true
  mode    = $Mode
  base    = $Base
  commit  = $commit
  summary = $steps
} | Out-Host