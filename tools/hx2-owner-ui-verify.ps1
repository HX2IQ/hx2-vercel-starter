param(
  [switch]$SkipTypeScript
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

$Started = [System.Diagnostics.Stopwatch]::StartNew()

Write-Host ""
Write-Host "== HX2 OWNER UI VERIFY LANE ==" -ForegroundColor Cyan

$RequiredFiles = @(
  "app/owner-status/page.tsx",
  "app/owner-status/_components/OwnerQuickLinks.tsx",
  "app/owner-status/_components/DeploymentFreshnessBadge.tsx",
  "tools/hx2-owner-status-ui-probe.ps1"
)

Write-Host ""
Write-Host "FILE CHECKS" -ForegroundColor Cyan

foreach ($File in $RequiredFiles) {
  if (-not (Test-Path $File)) {
    throw "Missing required owner UI file: $File"
  }

  Write-Host ("GREEN: found {0}" -f $File) -ForegroundColor Green
}

Write-Host ""
Write-Host "MARKER CHECKS" -ForegroundColor Cyan

$MarkerChecks = @(
  [pscustomobject]@{
    File = "app/owner-status/page.tsx"
    Markers = @(
      "HX2 Owner Status",
      "OwnerQuickLinks",
      "DeploymentFreshnessBadge",
      "/api/hx2/owner-status",
      "/api/hx2/retrieval-status",
      "/api/hx2/deployment-status",
      "Refresh status",
      "Last refreshed"
    )
  },
  [pscustomobject]@{
    File = "app/owner-status/_components/OwnerQuickLinks.tsx"
    Markers = @(
      "Owner Quick Links",
      "Status Shortcuts",
      "Owner API",
      "Retrieval API",
      "Deployment API",
      "Command Reference"
    )
  },
  [pscustomobject]@{
    File = "app/owner-status/_components/DeploymentFreshnessBadge.tsx"
    Markers = @(
      "Deployment Freshness",
      "Production Freshness Visible",
      "Live SHA",
      "Metadata Only",
      "npm run hx2:deployment:status"
    )
  },
  [pscustomobject]@{
    File = "tools/hx2-owner-status-ui-probe.ps1"
    Markers = @(
      "HX2 OWNER STATUS UI PROBE",
      "CHECK OWNER STATUS PAGE SHELL",
      "CHECK RETRIEVAL STATUS API USED BY CLIENT CARD",
      "CHECK DEPLOYMENT STATUS API USED BY CLIENT CARD",
      "owner status UI probe passed"
    )
  }
)

foreach ($Check in $MarkerChecks) {
  foreach ($Marker in $Check.Markers) {
    $Hit = Select-String -Path $Check.File -Pattern $Marker -SimpleMatch -Quiet

    if (-not $Hit) {
      throw "Missing marker '$Marker' in $($Check.File)"
    }
  }

  Write-Host ("GREEN: markers passed for {0}" -f $Check.File) -ForegroundColor Green
}

Write-Host ""
Write-Host "POWERSHELL PARSER CHECK" -ForegroundColor Cyan

$ProbeScript = "tools/hx2-owner-status-ui-probe.ps1"
$Tokens = $null
$ParseErrors = $null
[System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path $ProbeScript), [ref]$Tokens, [ref]$ParseErrors) | Out-Null

if ($ParseErrors -and $ParseErrors.Count -gt 0) {
  $ParseErrors | Format-List
  throw "PowerShell parser found errors in owner status UI probe."
}

Write-Host "GREEN: owner status UI probe parser check passed" -ForegroundColor Green

if ($SkipTypeScript) {
  Write-Host ""
  Write-Host "YELLOW: TypeScript check skipped by request." -ForegroundColor Yellow
} else {
  Write-Host ""
  Write-Host "TYPESCRIPT CHECK" -ForegroundColor Cyan

  $LocalTsc = Join-Path $Root "node_modules\.bin\tsc.cmd"

  if (Test-Path $LocalTsc) {
    & $LocalTsc --noEmit --pretty false
  } else {
    npx tsc --noEmit --pretty false
  }

  if ($LASTEXITCODE -ne 0) {
    throw "TypeScript check failed."
  }

  Write-Host "GREEN: TypeScript check passed" -ForegroundColor Green
}

$Started.Stop()

Write-Host ""
Write-Host ("GREEN: owner UI verify lane passed in {0} ms" -f $Started.ElapsedMilliseconds) -ForegroundColor Green
