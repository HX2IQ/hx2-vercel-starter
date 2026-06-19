param(
  [string]$Base = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 DEPLOYMENT STATUS PROBE ==" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($Base)) {
  if (-not [string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_APP_URL)) {
    $Base = $env:NEXT_PUBLIC_APP_URL
  } elseif (-not [string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_SITE_URL)) {
    $Base = $env:NEXT_PUBLIC_SITE_URL
  } else {
    $Base = "https://optinodeiq.com"
  }
}

$Base = $Base.TrimEnd("/")
$Url = "$Base/api/hx2/deployment-status"

Write-Host ("Base: {0}" -f $Base)
Write-Host ("URL:  {0}" -f $Url)

$Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30

if (-not $Response.ok) {
  throw "Deployment status endpoint did not return ok=true."
}

if ($Response.route -ne "/api/hx2/deployment-status") {
  throw "Unexpected deployment status route: $($Response.route)"
}

if ($Response.ip_firewall -ne "safe_metadata_only_no_brain_logic") {
  throw "Unexpected IP firewall value: $($Response.ip_firewall)"
}

$LocalHead = ""
try {
  $LocalHead = (git rev-parse --short HEAD).Trim()
} catch {
  $LocalHead = "unknown"
}

$LiveShort = [string]$Response.deployment.commit_short

Write-Host ""
Write-Host "DEPLOYMENT" -ForegroundColor Cyan
Write-Host ("Environment: {0}" -f $Response.deployment.environment)
Write-Host ("Branch:      {0}" -f $Response.deployment.branch)
Write-Host ("Live SHA:    {0}" -f $LiveShort)
Write-Host ("Local HEAD:  {0}" -f $LocalHead)
Write-Host ("Vercel URL:  {0}" -f $Response.deployment.vercel_url)
Write-Host ("Generated:   {0}" -f $Response.generated_at)

if ($LiveShort -eq "unknown") {
  Write-Host "YELLOW: live deployment SHA is unknown; Vercel may not expose commit env vars in this context." -ForegroundColor Yellow
} elseif ($LocalHead -ne "unknown" -and $LiveShort -ne $LocalHead) {
  Write-Host "YELLOW: live deployment SHA does not match local HEAD. Production may not be on the latest commit yet." -ForegroundColor Yellow
} else {
  Write-Host "GREEN: live deployment SHA matches local HEAD" -ForegroundColor Green
}

Write-Host ""
Write-Host "GREEN: deployment status probe passed" -ForegroundColor Green
