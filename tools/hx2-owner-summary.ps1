$ErrorActionPreference = "Stop"

function Test-BaselineComplete {
  param([string]$Dir)

  $required = @(
    "brain-status.json",
    "x2-baseline.json",
    "x2-baseline.reply.txt",
    "h2-baseline.json",
    "h2-baseline.reply.txt",
    "x2-mixed.json",
    "x2-mixed.reply.txt",
    "h2-cross.json",
    "h2-cross.reply.txt",
    "manifest.json"
  )

  foreach ($name in $required) {
    if (-not (Test-Path (Join-Path $Dir $name))) {
      return $false
    }
  }

  return $true
}

function Get-LatestItem {
  param(
    [string]$Path,
    [string]$Filter = "*",
    [switch]$Directory
  )

  if (-not (Test-Path $Path)) { return $null }

  if ($Directory) {
    return Get-ChildItem $Path -Directory |
      Where-Object { $_.Name -ne "_incomplete" -and (Test-BaselineComplete $_.FullName) } |
      Sort-Object Name -Descending |
      Select-Object -First 1
  }

  return Get-ChildItem $Path -File -Filter $Filter | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}

$baseline = Get-LatestItem ".\tools\baselines" -Directory
$release  = Get-LatestItem ".\tools\release-notes" -Filter "*.md"
$autopsy  = Get-LatestItem ".\tools\_autopsy" -Directory
$dashboardPath = ".\tools\dashboards\hx2-drift-dashboard.html"
$deployLogPath = ".\tools\_postflight-vercel-deploy.log"
$jsonOutPath = ".\tools\dashboards\hx2-owner-summary.json"

$completeBaselines = @()
if (Test-Path ".\tools\baselines") {
  $completeBaselines = Get-ChildItem ".\tools\baselines" -Directory |
    Where-Object { $_.Name -ne "_incomplete" -and (Test-BaselineComplete $_.FullName) } |
    Sort-Object Name -Descending
}

$stagingCount = if (Test-Path ".\tools\baselines\_staging") { @(Get-ChildItem ".\tools\baselines\_staging" -Directory).Count } else { 0 }
$incompleteCount = if (Test-Path ".\tools\baselines\_incomplete") { @(Get-ChildItem ".\tools\baselines\_incomplete" -Directory).Count } else { 0 }

$summary = [pscustomobject]@{
  generated_at = (Get-Date).ToString("s")
  latest_baseline = if ($baseline) { $baseline.FullName } else { $null }
  latest_release_note = if ($release) { $release.FullName } else { $null }
  latest_autopsy = if ($autopsy) { $autopsy.FullName } else { $null }
  drift_dashboard = if (Test-Path $dashboardPath) { (Resolve-Path $dashboardPath).Path } else { $null }
  deploy_log = if (Test-Path $deployLogPath) { (Resolve-Path $deployLogPath).Path } else { $null }
  autopsy_count = if (Test-Path ".\tools\_autopsy") { @(Get-ChildItem ".\tools\_autopsy" -Directory).Count } else { 0 }
  baseline_count = @($completeBaselines).Count
  release_note_count = if (Test-Path ".\tools\release-notes") { @(Get-ChildItem ".\tools\release-notes" -File -Filter "*.md").Count } else { 0 }
  staging_count = $stagingCount
  incomplete_count = $incompleteCount
}

New-Item -ItemType Directory -Force -Path ".\tools\dashboards" | Out-Null
$summary | ConvertTo-Json -Depth 10 | Set-Content $jsonOutPath -Encoding UTF8

$rows = @(
  [pscustomobject]@{ item = "Latest baseline";     path = if ($baseline) { $baseline.FullName } else { "not found" } }
  [pscustomobject]@{ item = "Latest release note"; path = if ($release)  { $release.FullName }  else { "not found" } }
  [pscustomobject]@{ item = "Latest autopsy";      path = if ($autopsy)  { $autopsy.FullName }  else { "none recorded" } }
  [pscustomobject]@{ item = "Drift dashboard";     path = if (Test-Path $dashboardPath) { (Resolve-Path $dashboardPath).Path } else { "not found" } }
  [pscustomobject]@{ item = "Deploy log";          path = if (Test-Path $deployLogPath) { (Resolve-Path $deployLogPath).Path } else { "not found" } }
  [pscustomobject]@{ item = "Summary JSON";        path = (Resolve-Path $jsonOutPath).Path }
)

Write-Host "== HX2 OWNER SUMMARY ==" -ForegroundColor Cyan
$rows | Format-Table -AutoSize

Write-Host ""

if ($release) {
  Write-Host "== LATEST RELEASE NOTE PREVIEW ==" -ForegroundColor Cyan
  Get-Content $release.FullName | Select-Object -First 20
  Write-Host ""
}

if ($baseline) {
  Write-Host "== LATEST BASELINE FILES ==" -ForegroundColor Cyan
  Get-ChildItem $baseline.FullName | Select-Object Name,Length,LastWriteTime | Format-Table -AutoSize
}

