$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 VERIFY TIMING REPORT ==" -ForegroundColor Cyan
Write-Host ""

$results = @()

function Run-Timed($Name, $Command) {
  Write-Host "Running $Name..." -ForegroundColor Yellow
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  Invoke-Expression $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed"
  }
  $sw.Stop()

  $script:results += [pscustomobject]@{
    Check = $Name
    Seconds = [math]::Round($sw.Elapsed.TotalSeconds, 2)
  }
}

Run-Timed "Quick Verify" "npm run hx2:quick"
Run-Timed "Master Guard" "npm run hx2:guard"
Run-Timed "Build" "npm run build"

Write-Host ""
Write-Host "HX2 VERIFY TIMING SUMMARY" -ForegroundColor Green
$results | Format-Table -AutoSize
