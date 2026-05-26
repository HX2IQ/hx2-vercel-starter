param(
  [string]$BaselineRoot = ".\tools\baselines",
  [string]$ReleaseNotesRoot = ".\tools\release-notes",
  [string]$AutopsyRoot = ".\tools\_autopsy",
  [string]$OutFile = ".\tools\dashboards\hx2-drift-dashboard.html"
)

$ErrorActionPreference = "Stop"

function Read-Json {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  return (Get-Content $Path -Raw | ConvertFrom-Json)
}

function Get-BaselineRows {
  param([string]$Root)

  $rows = @()
  if (-not (Test-Path $Root)) { return $rows }

  $dirs = Get-ChildItem $Root -Directory | Sort-Object Name
  foreach ($dir in $dirs) {
    $x2 = Read-Json (Join-Path $dir.FullName "x2-baseline.json")
    $h2 = Read-Json (Join-Path $dir.FullName "h2-baseline.json")

    $rows += [pscustomobject]@{
      baseline              = $dir.Name
      x2_anchor             = if ($x2) { $x2.anchor_source } else { "" }
      h2_anchor             = if ($h2) { $h2.anchor_source } else { "" }
      x2_direct_count       = if ($x2) { $x2.catalyst_summary.direct_catalysts.Count } else { "" }
      h2_direct_count       = if ($h2) { $h2.catalyst_summary.direct_catalysts.Count } else { "" }
      x2_indirect_count     = if ($x2) { $x2.catalyst_summary.indirect_backdrop.Count } else { "" }
      x2_narrative_count    = if ($x2) { $x2.catalyst_summary.narrative_support.Count } else { "" }
      h2_narrative_count    = if ($h2) { $h2.catalyst_summary.narrative_support.Count } else { "" }
    }
  }

  return $rows
}

function Get-ReleaseRows {
  param([string]$Root)

  $rows = @()
  if (-not (Test-Path $Root)) { return $rows }

  $files = Get-ChildItem $Root -File | Sort-Object LastWriteTime
  foreach ($file in $files) {
    $rows += [pscustomobject]@{
      file = $file.Name
      time = $file.LastWriteTime.ToString("s")
      size = $file.Length
    }
  }

  return $rows
}

function Get-AutopsyRows {
  param([string]$Root)

  $rows = @()
  if (-not (Test-Path $Root)) { return $rows }

  $dirs = Get-ChildItem $Root -Directory | Sort-Object Name
  foreach ($dir in $dirs) {
    $summary = Join-Path $dir.FullName "summary.txt"
    $reason = ""
    if (Test-Path $summary) {
      $text = Get-Content $summary -Raw
      if ($text -match 'Reason:\s*(.+)') {
        $reason = $matches[1].Trim()
      }
    }

    $rows += [pscustomobject]@{
      folder = $dir.Name
      reason = $reason
      time   = $dir.LastWriteTime.ToString("s")
    }
  }

  return $rows
}

$baselineRows = Get-BaselineRows -Root $BaselineRoot
$releaseRows  = Get-ReleaseRows -Root $ReleaseNotesRoot
$autopsyRows  = Get-AutopsyRows -Root $AutopsyRoot

$x2AnchorStable = ($baselineRows | Select-Object -ExpandProperty x2_anchor -Unique).Count -le 1
$h2AnchorStable = ($baselineRows | Select-Object -ExpandProperty h2_anchor -Unique).Count -le 1

$autopsyCount = @($autopsyRows).Count
$baselineCount = @($baselineRows).Count
$releaseCount = @($releaseRows).Count

function Convert-ToHtmlTable {
  param([object[]]$Rows)

  if (-not $Rows -or $Rows.Count -eq 0) {
    return "<p>No data.</p>"
  }

  return ($Rows | ConvertTo-Html -Fragment)
}

$baselineTable = Convert-ToHtmlTable $baselineRows
$releaseTable = Convert-ToHtmlTable $releaseRows
$autopsyTable = Convert-ToHtmlTable $autopsyRows

$html = @"
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HX2 Drift Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; background: #0b1020; color: #e8ecf3; }
    h1, h2 { color: #ffffff; }
    .cards { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .card { background: #151c33; border: 1px solid #2b355a; border-radius: 12px; padding: 16px; min-width: 220px; }
    .ok { color: #62d26f; font-weight: bold; }
    .warn { color: #ffd166; font-weight: bold; }
    table { border-collapse: collapse; width: 100%; background: #11182d; margin-bottom: 24px; }
    th, td { border: 1px solid #2b355a; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #1a2445; }
    p { line-height: 1.4; }
  </style>
</head>
<body>
  <h1>HX2 Drift Dashboard</h1>
  <p>Generated: $(Get-Date -Format s)</p>

  <div class="cards">
    <div class="card">
      <h2>Baselines</h2>
      <div>$baselineCount</div>
    </div>
    <div class="card">
      <h2>Release Notes</h2>
      <div>$releaseCount</div>
    </div>
    <div class="card">
      <h2>Autopsies</h2>
      <div>$autopsyCount</div>
    </div>
    <div class="card">
      <h2>X2 Anchor Stability</h2>
      <div class="$(if ($x2AnchorStable) { 'ok' } else { 'warn' })">$(if ($x2AnchorStable) { 'Stable' } else { 'Drifting' })</div>
    </div>
    <div class="card">
      <h2>H2 Anchor Stability</h2>
      <div class="$(if ($h2AnchorStable) { 'ok' } else { 'warn' })">$(if ($h2AnchorStable) { 'Stable' } else { 'Drifting' })</div>
    </div>
  </div>

  <h2>Baseline History</h2>
  $baselineTable

  <h2>Release Notes</h2>
  $releaseTable

  <h2>Autopsy History</h2>
  $autopsyTable
</body>
</html>
"@

Set-Content $OutFile $html -Encoding UTF8
Write-Host "Dashboard created: $OutFile" -ForegroundColor Green
