param(
  [string]$Base = ""
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
$PageUrl = "$Base/owner-status"
$RetrievalUrl = "$Base/api/hx2/retrieval-status"

Write-Host ("Base:          {0}" -f $Base)
Write-Host ("Owner UI URL:  {0}" -f $PageUrl)
Write-Host ("Retrieval API: {0}" -f $RetrievalUrl)

Write-Host ""
Write-Host "CHECK OWNER STATUS PAGE SHELL" -ForegroundColor Cyan

$PageResponse = Invoke-WebRequest -Uri $PageUrl -Method GET -TimeoutSec 30 -UseBasicParsing

if ($PageResponse.StatusCode -lt 200 -or $PageResponse.StatusCode -ge 300) {
  throw "Owner status UI returned non-2xx status: $($PageResponse.StatusCode)"
}

$PageContent = [string]$PageResponse.Content

$RequiredPageMarkers = @(
  "HX2 Owner Status",
  "Owner Visibility Layer",
  "/api/hx2/owner-status"
)

foreach ($Marker in $RequiredPageMarkers) {
  if ($PageContent -notmatch [regex]::Escape($Marker)) {
    throw "Owner status UI shell marker not found: $Marker"
  }
}

Write-Host "GREEN: owner status page shell markers found" -ForegroundColor Green

Write-Host ""
Write-Host "CHECK RETRIEVAL STATUS API USED BY CLIENT CARD" -ForegroundColor Cyan

$RetrievalResponse = Invoke-RestMethod -Uri $RetrievalUrl -Method GET -TimeoutSec 30

if (-not $RetrievalResponse.ok) {
  throw "Retrieval status API did not return ok=true."
}

if ($RetrievalResponse.route -ne "/api/hx2/retrieval-status") {
  throw "Unexpected retrieval status route: $($RetrievalResponse.route)"
}

if ($RetrievalResponse.ip_firewall -ne "safe_metadata_only_no_brain_logic") {
  throw "Unexpected IP firewall value: $($RetrievalResponse.ip_firewall)"
}

$CapabilityIds = @($RetrievalResponse.capabilities | ForEach-Object { $_.id })

$RequiredCapabilities = @(
  "web-local-first",
  "youtube-local-first",
  "retrieval-quality-smoke",
  "verify-auto-router"
)

foreach ($Capability in $RequiredCapabilities) {
  if ($CapabilityIds -notcontains $Capability) {
    throw "Retrieval capability not found: $Capability"
  }
}

Write-Host "GREEN: retrieval status API markers found" -ForegroundColor Green

Write-Host ""
Write-Host "NOTE: Retrieval Health is client-rendered after browser hydration, so this probe validates the page shell plus the API data source instead of requiring hydrated browser text." -ForegroundColor Yellow

Write-Host ""
Write-Host "GREEN: owner status UI probe passed" -ForegroundColor Green
