param(
  [int]$Runs = 20,
  [int]$Top = 10,
  [ValidateSet("All", "Full", "Fast", "Unknown")]
  [string]$Mode = "All"
)

$ErrorActionPreference = "Stop"

if ($Runs -lt 1) {
  throw "Runs must be at least 1."
}

if ($Top -lt 1) {
  throw "Top must be at least 1."
}

$RequestedMode = $Mode.ToUpperInvariant()
$VerifyRunDir = Join-Path $PSScriptRoot "_verify-runs"

if (-not (Test-Path $VerifyRunDir)) {
  Write-Host "No verify run log directory found: $VerifyRunDir" -ForegroundColor Yellow
  exit 0
}

$Logs =
  Get-ChildItem $VerifyRunDir -Filter "*.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First $Runs

if (-not $Logs -or @($Logs).Count -eq 0) {
  Write-Host "No verify run logs found." -ForegroundColor Yellow
  exit 0
}

function Get-Hx2VerifyMode {
  param([string[]]$Lines)

  $DetectedMode = "UNKNOWN"

  foreach ($Line in $Lines) {
    if ($Line -match 'Verify mode label:\s*(?<Mode>FAST|FULL)\s*$') {
      return $Matches.Mode.ToUpperInvariant()
    }

    if ($Line -match 'Fast mode:\s*(?<Fast>True|False)\s*$') {
      if ($Matches.Fast -eq "True") {
        $DetectedMode = "FAST"
      } elseif ($Matches.Fast -eq "False") {
        $DetectedMode = "FULL"
      }
    }
  }

  return $DetectedMode
}

$GuardRows = @()
$TotalRows = @()
$ModeCounts = @{}

foreach ($Log in $Logs) {
  $Lines = Get-Content $Log.FullName
  $VerifyMode = Get-Hx2VerifyMode -Lines $Lines

  if (-not $ModeCounts.ContainsKey($VerifyMode)) {
    $ModeCounts[$VerifyMode] = 0
  }
  $ModeCounts[$VerifyMode]++

  if ($RequestedMode -ne "ALL" -and $VerifyMode -ne $RequestedMode) {
    continue
  }

  foreach ($Line in $Lines) {
    if ($Line -match 'Total runtime ms:\s*(?<Ms>\d+)') {
      $TotalRows += [pscustomobject]@{
        LastWriteTime = $Log.LastWriteTime
        Mode = $VerifyMode
        TotalMs = [int]$Matches.Ms
        Run = $Log.Name
      }
    }

    if ($Line -match '^\[[^\]]+\]\s+-\s+(?<Guard>.+?):\s+(?<Ms>\d+)\s+ms\s*$') {
      $GuardRows += [pscustomobject]@{
        LastWriteTime = $Log.LastWriteTime
        Mode = $VerifyMode
        Guard = $Matches.Guard
        Milliseconds = [int]$Matches.Ms
        Run = $Log.Name
      }
    }
  }
}

Write-Host ""
Write-Host ("HX2 VERIFY SPEED REPORT: last {0} run logs / mode filter: {1}" -f @($Logs).Count, $RequestedMode) -ForegroundColor Cyan

Write-Host ""
Write-Host "LOG MODE INVENTORY" -ForegroundColor Cyan

$ModeCounts.GetEnumerator() |
  Sort-Object Name |
  ForEach-Object {
    [pscustomobject]@{
      Mode = $_.Name
      Logs = $_.Value
    }
  } |
  Format-Table -AutoSize

if (@($TotalRows).Count -eq 0) {
  Write-Host ""
  Write-Host "No verify run totals found for this mode filter." -ForegroundColor Yellow
  exit 0
}

Write-Host ""
Write-Host "VERIFY RUN TOTALS" -ForegroundColor Cyan

$TotalRows |
  Sort-Object LastWriteTime -Descending |
  Select-Object LastWriteTime, Mode, TotalMs, Run |
  Format-Table -AutoSize

Write-Host ""
Write-Host "VERIFY MODE TOTAL SUMMARY" -ForegroundColor Cyan

$TotalRows |
  Group-Object Mode |
  ForEach-Object {
    $Rows = $_.Group
    [pscustomobject]@{
      Mode = $_.Name
      Runs = @($Rows).Count
      AverageMs = [Math]::Round((($Rows | Measure-Object TotalMs -Average).Average), 0)
      FastestMs = ($Rows | Measure-Object TotalMs -Minimum).Minimum
      SlowestMs = ($Rows | Measure-Object TotalMs -Maximum).Maximum
    }
  } |
  Sort-Object Mode |
  Format-Table -AutoSize

$AverageTotal = [Math]::Round((($TotalRows | Measure-Object TotalMs -Average).Average), 0)
$MaxTotal = ($TotalRows | Measure-Object TotalMs -Maximum).Maximum
$MinTotal = ($TotalRows | Measure-Object TotalMs -Minimum).Minimum

Write-Host ("Average total runtime: {0} ms" -f $AverageTotal)
Write-Host ("Fastest total runtime: {0} ms" -f $MinTotal)
Write-Host ("Slowest total runtime: {0} ms" -f $MaxTotal)

if (@($GuardRows).Count -eq 0) {
  Write-Host ""
  Write-Host "No slow-guard radar rows found for this mode filter." -ForegroundColor Yellow
  exit 0
}

$Summary =
  $GuardRows |
    Group-Object Mode, Guard |
    ForEach-Object {
      $Rows = $_.Group
      $First = $Rows | Select-Object -First 1

      [pscustomobject]@{
        Mode = $First.Mode
        Guard = $First.Guard
        Seen = @($Rows).Count
        AverageMs = [Math]::Round((($Rows | Measure-Object Milliseconds -Average).Average), 0)
        MaxMs = ($Rows | Measure-Object Milliseconds -Maximum).Maximum
        MinMs = ($Rows | Measure-Object Milliseconds -Minimum).Minimum
        LastMs = ($Rows | Sort-Object LastWriteTime -Descending | Select-Object -First 1).Milliseconds
      }
    } |
    Sort-Object AverageMs -Descending |
    Select-Object -First $Top

Write-Host ""
Write-Host ("SLOWEST GUARDS ACROSS RECENT RUNS: top {0} / mode filter: {1}" -f $Top, $RequestedMode) -ForegroundColor Cyan

$Summary | Format-Table -AutoSize

Write-Host "GREEN: verify speed report complete" -ForegroundColor Green
