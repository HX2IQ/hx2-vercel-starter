param(
  [string]$Domain = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B VERCEL ALIAS GUARD =="

$VercelCmd = Get-Command vercel.cmd -ErrorAction SilentlyContinue
$VercelExe = Get-Command vercel -ErrorAction SilentlyContinue

$PreviousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"

if ($VercelCmd) {
  $Inspect = & $VercelCmd.Source inspect $Domain 2>&1 | Out-String
} elseif ($VercelExe) {
  $Inspect = & $VercelExe.Source inspect $Domain 2>&1 | Out-String
} else {
  $Inspect = & npx.cmd vercel inspect $Domain 2>&1 | Out-String
}

$ErrorActionPreference = $PreviousErrorActionPreference

if ([string]::IsNullOrWhiteSpace($Inspect)) {
  throw "Vercel alias guard failed: empty inspect response"
}

if ($Inspect -notmatch "target\s+production") {
  throw "Vercel alias guard failed: domain is not pointing to production target"
}

if ($Inspect -notmatch "https://optinodeiq\.com") {
  throw "Vercel alias guard failed: optinodeiq.com alias missing"
}

if ($Inspect -notmatch "https://www\.optinodeiq\.com") {
  throw "Vercel alias guard failed: www.optinodeiq.com alias missing"
}

# Readiness is verified by live route probe instead of fragile CLI status text.
try {
  $Base = Invoke-RestMethod "$Domain/api/hx2_base"
  if ($Base.ok -ne $true) {
    throw "hx2_base did not return ok=true"
  }
} catch {
  throw "Vercel alias guard failed: production alias route probe failed. $($_.Exception.Message)"
}

Write-Host "PHASE 3B VERCEL ALIAS GUARD PASSED"
