$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B PRODUCTION PROBE EXISTENCE GUARD =="

$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

if (!(Test-Path $VerifyPath)) {
  throw "Missing master production verify script: $VerifyPath"
}

$Verify = Get-Content $VerifyPath -Raw

$ProbeMatches = [regex]::Matches($Verify, '"tools/sprint-next/[^"]+production-probe\.ps1"')

foreach ($Match in $ProbeMatches) {
  $ProbePath = $Match.Value.Trim('"')

  if (!(Test-Path $ProbePath)) {
    throw "Master production verify references missing probe: $ProbePath"
  }
}

if ($ProbeMatches.Count -lt 5) {
  throw "Master production verify has too few production probes: $($ProbeMatches.Count)"
}

Write-Host "PHASE 3B PRODUCTION PROBE EXISTENCE GUARD PASSED"
