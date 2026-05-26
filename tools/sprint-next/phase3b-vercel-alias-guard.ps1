param(
  [string]$Domain = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== PHASE 3B VERCEL ALIAS GUARD =="

$Inspect = npx vercel inspect $Domain 2>&1 | Out-String

if ($Inspect -notmatch "target\s+production") {
  throw "Vercel alias guard failed: domain is not pointing to production target"
}

if ($Inspect -notmatch "status\s+● Ready") {
  throw "Vercel alias guard failed: production deployment is not Ready"
}

if ($Inspect -notmatch "https://optinodeiq\.com") {
  throw "Vercel alias guard failed: optinodeiq.com alias missing from inspect output"
}

if ($Inspect -notmatch "https://www\.optinodeiq\.com") {
  throw "Vercel alias guard failed: www.optinodeiq.com alias missing from inspect output"
}

Write-Host "PHASE 3B VERCEL ALIAS GUARD PASSED"
