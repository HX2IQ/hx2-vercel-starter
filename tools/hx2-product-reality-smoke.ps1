param(
  [string]$Base = "",
  [switch]$LocalOnly,
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

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

Write-Host ""
Write-Host "== HX2 PRODUCT REALITY SMOKE ==" -ForegroundColor Cyan
Write-Host ("Base:       {0}" -f $Base)
Write-Host ("Local only: {0}" -f [bool]$LocalOnly)
Write-Host ("Strict:     {0}" -f [bool]$Strict)

function Get-Hx2FileText {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }

  return (Get-Content -LiteralPath $Path) -join "`n"
}

function Test-Hx2FileMarker {
  param(
    [string]$Path,
    [string[]]$Markers
  )

  $Text = Get-Hx2FileText -Path $Path
  $Missing = @()

  foreach ($Marker in $Markers) {
    if ($Text -notmatch [regex]::Escape($Marker)) {
      $Missing += $Marker
    }
  }

  if ($Missing.Count -eq 0) {
    return [pscustomobject]@{
      Check = $Path
      Status = "GREEN"
      Detail = "markers found"
    }
  }

  return [pscustomobject]@{
    Check = $Path
    Status = "YELLOW"
    Detail = "missing: $($Missing -join ', ')"
  }
}

function Test-Hx2LiveEndpoint {
  param(
    [string]$Path,
    [string]$ExpectedRoute = ""
  )

  if ($LocalOnly) {
    return [pscustomobject]@{
      Check = $Path
      Status = "SKIPPED"
      Detail = "local-only mode"
    }
  }

  $Url = "$Base$Path"

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30

    if ($ExpectedRoute -and $Response.route -and $Response.route -ne $ExpectedRoute) {
      return [pscustomobject]@{
        Check = $Path
        Status = "YELLOW"
        Detail = "route mismatch: $($Response.route)"
      }
    }

    if ($Response.ok -eq $false) {
      return [pscustomobject]@{
        Check = $Path
        Status = "YELLOW"
        Detail = "ok=false"
      }
    }

    return [pscustomobject]@{
      Check = $Path
      Status = "GREEN"
      Detail = "live endpoint responded"
    }
  } catch {
    return [pscustomobject]@{
      Check = $Path
      Status = "YELLOW"
      Detail = $_.Exception.Message
    }
  }
}

function Invoke-Hx2NpmProbe {
  param(
    [string]$Name,
    [string]$Command
  )

  Write-Host ""
  Write-Host ("RUN PROBE: {0}" -f $Name) -ForegroundColor Cyan

  npm run $Command
  $Exit = $LASTEXITCODE

  if ($Exit -eq 0) {
    return [pscustomobject]@{
      Check = $Name
      Status = "GREEN"
      Detail = $Command
    }
  }

  return [pscustomobject]@{
    Check = $Name
    Status = "YELLOW"
    Detail = "$Command exited $Exit"
  }
}

Write-Host ""
Write-Host "LIVE PRODUCT SURFACES" -ForegroundColor Cyan

$LiveRows = @()
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/deployment-status" -ExpectedRoute "/api/hx2/deployment-status"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/owner-status" -ExpectedRoute "/api/hx2/owner-status"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/retrieval-status" -ExpectedRoute "/api/hx2/retrieval-status"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/chat-master-status"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/chat-master-readiness"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/chat-master-diagnostics"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/chat-master-route-test"
$LiveRows += Test-Hx2LiveEndpoint -Path "/api/hx2/orchestrator-status"

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LOCAL PRODUCT CONTRACT MARKERS" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2FileMarker -Path ".\app\api\hx2\chat-master\route.ts" -Markers @("POST", "chat-master", "retrieval")
$LocalRows += Test-Hx2FileMarker -Path ".\app\api\hx2\chat\route.ts" -Markers @("POST")
$LocalRows += Test-Hx2FileMarker -Path ".\app\api\hx2\_lib\chat-master-router.ts" -Markers @("router")
$LocalRows += Test-Hx2FileMarker -Path ".\app\api\hx2\_lib\capability-planner.ts" -Markers @("capability")
$LocalRows += Test-Hx2FileMarker -Path ".\tools\hx2-functional-capability-audit.ps1" -Markers @("Functional green layers", "Master orchestrator", "KGX", "Worker", "Auth")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "FOUNDATION PROBES" -ForegroundColor Cyan

$ProbeRows = @()
$ProbeRows += Invoke-Hx2NpmProbe -Name "functional audit" -Command "hx2:functional:audit"
$ProbeRows += Invoke-Hx2NpmProbe -Name "master orchestrator probe" -Command "hx2:master:orchestrator:probe"
$ProbeRows += Invoke-Hx2NpmProbe -Name "KGX memory graph probe" -Command "hx2:kgx:memory:probe"
$ProbeRows += Invoke-Hx2NpmProbe -Name "worker execution probe" -Command "hx2:worker:execution:probe"
$ProbeRows += Invoke-Hx2NpmProbe -Name "auth billing probe" -Command "hx2:auth:billing:probe"

Write-Host ""
Write-Host "PROBE SUMMARY" -ForegroundColor Cyan
$ProbeRows | Format-Table -AutoSize

Write-Host ""
Write-Host "PRODUCT REALITY RESULT" -ForegroundColor Cyan

$AllRows = @($LiveRows + $LocalRows + $ProbeRows)
$Green = @($AllRows | Where-Object Status -eq "GREEN").Count
$Yellow = @($AllRows | Where-Object Status -eq "YELLOW").Count
$Red = @($AllRows | Where-Object Status -eq "RED").Count
$Skipped = @($AllRows | Where-Object Status -eq "SKIPPED").Count
$Total = @($AllRows).Count

[pscustomobject]@{
  Green = "$Green / $Total"
  Yellow = "$Yellow / $Total"
  Red = "$Red / $Total"
  Skipped = "$Skipped / $Total"
  Meaning = "This proves product-facing foundations and read-only surfaces, not full retail launch."
  Next = "If green/yellow acceptable, add live chat E2E smoke with safe preview payload."
} | Format-List

if ($Red -gt 0) {
  throw "Product reality smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  throw "Product reality strict smoke found yellow checks."
}

Write-Host ""
Write-Host "LOCAL GIT STATUS" -ForegroundColor Cyan
$Status = git status --short
if ($Status) {
  $Status
  Write-Host "YELLOW: working tree has changes." -ForegroundColor Yellow
} else {
  Write-Host "GREEN: working tree clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "GREEN: product reality smoke complete" -ForegroundColor Green
