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
$DeploymentUrl = "$Base/api/hx2/deployment-status"

Write-Host ("Base:           {0}" -f $Base)
Write-Host ("Owner UI URL:   {0}" -f $PageUrl)
Write-Host ("Retrieval API:  {0}" -f $RetrievalUrl)
Write-Host ("Deployment API: {0}" -f $DeploymentUrl)

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
  "Owner Quick Links",
  "Status Shortcuts",
  "/api/hx2/owner-status",
  "/api/hx2/retrieval-status",
  "/api/hx2/deployment-status"
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
  throw "Unexpected retrieval IP firewall value: $($RetrievalResponse.ip_firewall)"
}

Write-Host "GREEN: retrieval status API markers found" -ForegroundColor Green

Write-Host ""
Write-Host "CHECK DEPLOYMENT STATUS API USED BY CLIENT CARD" -ForegroundColor Cyan

$DeploymentResponse = Invoke-RestMethod -Uri $DeploymentUrl -Method GET -TimeoutSec 30

if (-not $DeploymentResponse.ok) {
  throw "Deployment status API did not return ok=true."
}

if ($DeploymentResponse.route -ne "/api/hx2/deployment-status") {
  throw "Unexpected deployment status route: $($DeploymentResponse.route)"
}

if ($DeploymentResponse.ip_firewall -ne "safe_metadata_only_no_brain_logic") {
  throw "Unexpected deployment IP firewall value: $($DeploymentResponse.ip_firewall)"
}

Write-Host ("Deployment environment: {0}" -f $DeploymentResponse.deployment.environment)
Write-Host ("Deployment branch:      {0}" -f $DeploymentResponse.deployment.branch)
Write-Host ("Deployment SHA:         {0}" -f $DeploymentResponse.deployment.commit_short)

Write-Host "GREEN: deployment status API markers found" -ForegroundColor Green

Write-Host ""
Write-Host "NOTE: Cards are client-rendered after browser hydration, so this probe validates the page shell plus the API data sources instead of requiring hydrated browser text." -ForegroundColor Yellow

Write-Host ""
Write-Host "GREEN: owner status UI probe passed" -ForegroundColor Green

