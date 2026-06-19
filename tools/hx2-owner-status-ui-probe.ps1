param(
  [string]$Ba
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

$RequiredMarkers = @(
  "HX2 Owner Status",
  "Owner Visibility Layer",
  "Retrieval Health",
  "/api/hx2/retrieval-status"
)

foreach ($Marker in $RequiredMarkers) {
  if ($Content -notmatch [regex]::Escape($Marker)) {
    throw "Owner status UI marker not found: $Marker"
  }
}

Write-Host ""
Write-Host "GREEN: owner status UI probe passed" -ForegroundColor Green
