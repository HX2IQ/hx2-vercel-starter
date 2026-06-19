param(
  [string]$Base
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 OWNER STATUS UI PROBE ==" -ForegroundColor Cyan

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
$Url = "$Base/owner-status"

Write-Host ("Base: {0}" -f $Base)
Write-Host ("URL:  {0}" -f $Url)

$Response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30 -UseBasicParsing

if ($Response.StatusCode -lt 200 -or $Response.StatusCode -ge 300) {
  throw "Owner status UI returned non-2xx status: $($Response.StatusCode)"
}

$Content = [string]$Response.Content

if ($Content -notmatch "HX2 Owner Status") {
  throw "Owner status UI marker not found."
}

if ($Content -notmatch "Owner Visibility Layer") {
  throw "Owner visibility marker not found."
}

Write-Host ""
Write-Host "GREEN: owner status UI probe passed" -ForegroundColor Green
