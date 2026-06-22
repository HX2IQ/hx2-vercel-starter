param(
  [string]$Base = "",
  [int]$MaxAttempts = 30,
  [int]$SleepSeconds = 10,
  [switch]$SkipOwnerProbes,
  [switch]$AllowDirtyTree
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 DEPLOYMENT SYNC WAITER ==" -ForegroundColor Cyan

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
$Url = "$Base/api/hx2/deployment-status"

$LocalHead = (git rev-parse --short HEAD).Trim()

Write-Host ("Base:             {0}" -f $Base)
Write-Host ("Status URL:       {0}" -f $Url)
Write-Host ("Local HEAD:       {0}" -f $LocalHead)
Write-Host ("Attempts:         {0}" -f $MaxAttempts)
Write-Host ("Interval:         {0}s" -f $SleepSeconds)
Write-Host ("Allow dirty tree: {0}" -f [bool]$AllowDirtyTree)

$LastLiveSha = "unknown"
$LastEnv = "unknown"
$LastBranch = "unknown"

for ($Attempt = 1; $Attempt -le $MaxAttempts; $Attempt++) {
  Write-Host ""
  Write-Host ("SYNC CHECK {0}/{1}" -f $Attempt, $MaxAttempts) -ForegroundColor Cyan

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30

    if (-not $Response.ok) {
      throw "Deployment status endpoint did not return ok=true."
    }

    $LastLiveSha = [string]$Response.deployment.commit_short
    $LastEnv = [string]$Response.deployment.environment
    $LastBranch = [string]$Response.deployment.branch

    Write-Host ("Environment: {0}" -f $LastEnv)
    Write-Host ("Branch:      {0}" -f $LastBranch)
    Write-Host ("Live SHA:    {0}" -f $LastLiveSha)
    Write-Host ("Local HEAD:  {0}" -f $LocalHead)

    if ($LastLiveSha -eq $LocalHead) {
      Write-Host ""
      Write-Host "GREEN: production deployment SHA matches local HEAD" -ForegroundColor Green

      if (-not $SkipOwnerProbes) {
        Write-Host ""
        Write-Host "== OWNER UI PROBE ==" -ForegroundColor Cyan
        powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "hx2-owner-status-ui-probe.ps1") -Base $Base
        if ($LASTEXITCODE -ne 0) { throw "owner status UI probe failed." }

        Write-Host ""
        Write-Host "== OWNER API PROBE ==" -ForegroundColor Cyan
        powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "hx2-owner-status-probe.ps1") -Base $Base
        if ($LASTEXITCODE -ne 0) { throw "owner status API probe failed." }
      }

      Write-Host ""
      Write-Host "== LOCAL TREE STATUS ==" -ForegroundColor Cyan
      $Status = git status --short

      if ($Status) {
        $Status

        if ($AllowDirtyTree) {
          Write-Host "YELLOW: working tree is dirty, but AllowDirtyTree is enabled for pre-commit tool validation." -ForegroundColor Yellow
        } else {
          throw "Working tree is not clean after deployment sync."
        }
      } else {
        Write-Host "GREEN: working tree clean" -ForegroundColor Green
      }

      Write-Host ""
      Write-Host "GREEN: deployment sync passed" -ForegroundColor Green
      exit 0
    }

    Write-Host "YELLOW: production is not on local HEAD yet." -ForegroundColor Yellow
  } catch {
    Write-Host ("YELLOW: deployment status check failed: {0}" -f $_.Exception.Message) -ForegroundColor Yellow
  }

  if ($Attempt -lt $MaxAttempts) {
    Start-Sleep -Seconds $SleepSeconds
  }
}

throw "Deployment sync did not reach local HEAD. Last live SHA: $LastLiveSha. Local HEAD: $LocalHead. Env: $LastEnv. Branch: $LastBranch."
