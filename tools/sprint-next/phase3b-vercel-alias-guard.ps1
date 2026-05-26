param(
  [string]$Domain = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B VERCEL ALIAS GUARD =="

$VercelCmd = Get-Command vercel.cmd -ErrorAction SilentlyContinue
$VercelExe = Get-Command vercel -ErrorAction SilentlyContinue

if ($VercelCmd) {
  $Inspect = & $VercelCmd.Source inspect $Domain 2>$null | Out-String
} elseif ($VercelExe) {
  $Inspect = & $VercelExe.Source inspect $Domain 2>$null | Out-String
} else {
  $Inspect = & npx.cmd vercel inspect $Domain 2>$null | Out-String
}

if ([string]::IsNullOrWhiteSpace($Inspect)) {
  throw "Vercel alias guard failed: empty inspect response"
}

if ($Inspect -notmatch "target\s+production") {
  throw "Vercel alias guard failed: domain is not pointing to production target"
}

if ($Inspect -notmatch "status\s+● Ready") {
  throw "Vercel alias guard failed: production deployment is not Ready"
}

if ($Inspect -notmatch "https://optinodeiq\.com") {
  throw "Vercel alias guard failed: optinodeiq.com alias missing"
}

if ($Inspect -notmatch "https://www\.optinodeiq\.com") {
  throw "Vercel alias guard failed: www.optinodeiq.com alias missing"
}

Write-Host "PHASE 3B VERCEL ALIAS GUARD PASSED"
