param(
  [string]$Base
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETRIEVAL STATUS PROBE ==" -ForegroundColor Cyan

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
$Url = "$Base/api/hx2/retrieval-status"

Write-Host ("Base: {0}" -f $Base)
Write-Host ("URL:  {0}" -f $Url)

$Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30

if (-not $Response.ok) {
  throw "Retrieval status endpoint did not return ok=true."
}

Write-Host ""
Write-Host "STATUS" -ForegroundColor Cyan
Write-Host ("Mode:        {0}" -f $Response.mode)
Write-Host ("Route:       {0}" -f $Response.route)
Write-Host ("IP Firewall: {0}" -f $Response.ip_firewall)
Write-Host ("Generated:   {0}" -f $Response.generated_at)

Write-Host ""
Write-Host "CAPABILITIES" -ForegroundColor Cyan
$Response.capabilities | Select-Object id, status, route, script, notes | Format-Table -AutoSize

Write-Host ""
Write-Host "SMOKE QUERIES" -ForegroundColor Cyan
$Response.smoke_queries | ForEach-Object {
  Write-Host ("- {0}" -f $_)
}

Write-Host ""
Write-Host "RECOMMENDED COMMANDS" -ForegroundColor Cyan
$Response.recommended_commands | ForEach-Object {
  Write-Host ("- {0}" -f $_)
}

Write-Host ""
Write-Host ("Next safe step: {0}" -f $Response.next_safe_step)

Write-Host ""
Write-Host "GREEN: retrieval status probe passed" -ForegroundColor Green
