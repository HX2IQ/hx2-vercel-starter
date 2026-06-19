param(
  [string]$Base
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 OWNER STATUS PROBE ==" -ForegroundColor Cyan

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
$Url = "$Base/api/hx2/owner-status"

Write-Host ("Base: {0}" -f $Base)
Write-Host ("URL:  {0}" -f $Url)

$Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30

if (-not $Response.ok) {
  throw "Owner status endpoint did not return ok=true."
}

Write-Host ""
Write-Host "OWNER STATUS" -ForegroundColor Cyan
Write-Host ("Mode:        {0}" -f $Response.mode)
Write-Host ("Route:       {0}" -f $Response.route)
Write-Host ("Generated:   {0}" -f $Response.generated_at)

Write-Host ""
Write-Host "READINESS" -ForegroundColor Cyan
$Response.readiness | Format-List

Write-Host ""
Write-Host "SURFACES" -ForegroundColor Cyan
$Response.surfaces | Select-Object id, status, endpoint, command, purpose | Format-Table -AutoSize

Write-Host ""
Write-Host "NEXT COMMANDS" -ForegroundColor Cyan
$Response.next_commands | Select-Object label, command | Format-Table -AutoSize

Write-Host ""
Write-Host ("Next safe step: {0}" -f $Response.next_safe_step)

Write-Host ""
Write-Host "GREEN: owner status probe passed" -ForegroundColor Green
