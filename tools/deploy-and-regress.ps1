param(
  [string]$Base = "https://patch.optinodeiq.com",
  [switch]$Deploy,
  [ValidateSet("fast","full")] [string]$Mode = "fast",
  [ValidateSet("recent","relevance")] [string]$RankMode = "recent",
  [int]$WarmupSeconds = 6
)

$ErrorActionPreference="Stop"
function Say($m){ Write-Host $m -ForegroundColor Cyan }

if ($Deploy) {
  Say "`n=== DEPLOY (vercel --prod) ===`n"
  vercel --prod
  Say "`nDeploy finished. Warming up for $WarmupSeconds seconds...`n"
  Start-Sleep -Seconds $WarmupSeconds
}

Say "`n=== REGRESSION ($Mode) ===`n"
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\regression.ps1 -Base $Base -Mode $Mode -RankMode $RankMode