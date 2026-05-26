param(
  [string]$Base = "https://patch.optinodeiq.com",
  [switch]$Deploy,
  [ValidateSet("fast","full")] [string]$Mode = "fast",
  [ValidateSet("recent","relevance")] [string]$RankMode = "recent",
  [int]$WarmupSeconds = 6
)

$ErrorActionPreference = "Stop"

function Say($m) {
  Write-Host $m -ForegroundColor Cyan
}

Say "`n=== HX2 MASTER GUARD ===`n"
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-master-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Master guard failed" }

Say "`n=== BUILD ===`n"
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

if ($Deploy) {
  Say "`n=== DEPLOY (vercel --prod) ===`n"
  vercel --prod
  if ($LASTEXITCODE -ne 0) { throw "Vercel deploy failed" }

  Say "`nDeploy finished. Warming up for $WarmupSeconds seconds...`n"
  Start-Sleep -Seconds $WarmupSeconds
}

Say "`n=== REGRESSION ($Mode) ===`n"
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\regression.ps1 -Base $Base -Mode $Mode -RankMode $RankMode
if ($LASTEXITCODE -ne 0) { throw "Regression failed" }

Say "`n=== POST REGRESSION MASTER GUARD ===`n"
powershell -ExecutionPolicy Bypass -File ".\tools\hx2-master-guard.ps1"
if ($LASTEXITCODE -ne 0) { throw "Post regression master guard failed" }

Say "`nDEPLOY AND REGRESS COMPLETE`n"
