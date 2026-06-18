param(
  [int]$Runs = 20,
  [int]$Top = 10
)

$ErrorActionPreference = "Stop"

if ($Runs -lt 1) {
  throw "Runs must be at least 1."
}

if ($Top -lt 1) {
  throw "Top must be at least 1."
}

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

$GuardRows = @()
$TotalRows = @()

foreach ($Log in $Logs) {
  $Lines = Get-Content $Log.FullName

  foreach ($Line in $Lines) {
    if ($Line -match 'Total runtime ms:\s*(?<Ms>\d+)') {
      $TotalRows += [pscustomobject]@{
        Run = $Log.Name
        LastWriteTime = $Log.LastWriteTime
        TotalMs = [int]$Matches.Ms
      }
    }

    if ($Line -match '^\[[^\]]+\]\s+-\s+(?<Guard>.+?):\s+(?<Ms>\d+)\s+ms\s*$') {
      $GuardRows += [pscustomobject]@{
        Run = $Log.Name
        LastWriteTime = $Log.LastWriteTime
        Guard = $Matches.Guard
        Milliseconds = [int]$Matches.Ms
      }
    }
  }
}

Write-Host ""
Write-Host ("HX2 VERIFY SPEED REPORT: last {0} run logs" -f @($Logs).Count) -ForegroundColor Cyan

if (@($TotalRows).Count -gt 0) {
  Write-Host ""
  Write-Host "VERIFY RUN TOTALS" -ForegroundColor Cyan

  $TotalRows |
    Sort-Object LastWriteTime -Descending |
    Select-Object LastWriteTime, TotalMs, Run |
    Format-Table -AutoSize

  $AverageTotal = [Math]::Round((($TotalRows | Measure-Object TotalMs -Average).Average), 0)
  $MaxTotal = ($TotalRows | Measure-Object TotalMs -Maximum).Maximum
  $MinTotal = ($TotalRows | Measure-Object TotalMs -Minimum).Minimum

  Write-Host ("Average total runtime: {0} ms" -f $AverageTotal)
  Write-Host ("Fastest total runtime: {0} ms" -f $MinTotal)
  Write-Host ("Slowest total runtime: {0} ms" -f $MaxTotal)
}

if (@($GuardRows).Count -eq 0) {
  Write-Host ""
  Write-Host "No slow-guard radar rows found yet. Run npm run hx2:quick:compact once after detailed logging is installed." -ForegroundColor Yellow
  exit 0
}

$Summary =
  $GuardRows |
    Group-Object Guard |
    ForEach-Object {
      $Rows = $_.Group
      [pscustomobject]@{
        Guard = $_.Name
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
Write-Host ("SLOWEST GUARDS ACROSS RECENT RUNS: top {0}" -f $Top) -ForegroundColor Cyan

$Summary | Format-Table -AutoSize

Write-Host "GREEN: verify speed report complete" -ForegroundColor Green
