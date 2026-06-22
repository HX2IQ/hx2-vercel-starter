param(
  [switch]$ForceFull,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 AUTO VERIFY ROUTER ==" -ForegroundColor Cyan

if ($DryRun) {
  Write-Host "Mode: DRY RUN - decision only, no verify command will be executed." -ForegroundColor Cyan
}

$QuickVerify = Join-Path $PSScriptRoot "hx2-quick-verify.ps1"
$OwnerUiVerify = Join-Path $PSScriptRoot "hx2-owner-ui-verify.ps1"

if (-not (Test-Path $QuickVerify)) {
  throw "Missing quick verify script: $QuickVerify"
}

if (-not (Test-Path $OwnerUiVerify)) {
  throw "Missing owner UI verify script: $OwnerUiVerify"
}

$StatusLines = git status --porcelain

if ($ForceFull) {
  Write-Host "AUTO VERIFY DECISION: FULL REQUIRED" -ForegroundColor Yellow
  Write-Host "Reason: ForceFull was provided."

  if ($DryRun) {
    Write-Host "DRY RUN: would run npm run hx2:quick:compact"
    exit 0
  }

  powershell -NoProfile -ExecutionPolicy Bypass -File $QuickVerify -Compact
  exit $LASTEXITCODE
}

if (-not $StatusLines -or @($StatusLines).Count -eq 0) {
  Write-Host "GREEN: working tree clean" -ForegroundColor Green
  Write-Host "No verify required unless you want a fresh confidence check."
  Write-Host "Run full confidence check manually with: npm run hx2:quick:compact"
  exit 0
}

$FullReasons = @()
$OwnerUiReasons = @()
$FastReasons = @()

function Get-Hx2ChangedPath {
  param([string]$StatusLine)

  $Raw = $StatusLine.Substring(3).Trim()

  if ($Raw -match " -> ") {
    $Parts = $Raw -split " -> "
    return $Parts[-1].Trim()
  }

  return $Raw
}

function Test-Hx2OwnerUiPath {
  param([string]$NormalizedPath)

  if ($NormalizedPath -eq "app/owner-status/page.tsx") {
    return $true
  }

  if ($NormalizedPath -match '^app/owner-status/_components/[^/]+\.tsx$') {
    return $true
  }

  if ($NormalizedPath -eq "tools/hx2-owner-status-ui-probe.ps1") {
    return $true
  }

  return $false
}

foreach ($Line in $StatusLines) {
  $Path = Get-Hx2ChangedPath -StatusLine $Line
  $Normalized = $Path -replace "\\", "/"

  $RequiresFull = $false
  $IsOwnerUiLane = $false
  $Reason = ""

  if (Test-Hx2OwnerUiPath -NormalizedPath $Normalized) {
    $IsOwnerUiLane = $true
    $Reason = "owner-status UI speed lane"
  } elseif ($Normalized -match '(^|/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$') {
    $RequiresFull = $true
    $Reason = "package/dependency/script surface changed"
  } elseif ($Normalized -match '(^|/)(tsconfig\.json|next\.config\.(js|mjs|ts)|middleware\.(ts|js)|prisma/schema\.prisma)$') {
    $RequiresFull = $true
    $Reason = "compiler/runtime/config surface changed"
  } elseif ($Normalized -match '\.(ts|tsx|js|jsx|mjs|cjs)$') {
    $RequiresFull = $true
    $Reason = "code file changed outside owner UI lane"
  } elseif ($Normalized -match '^(app|pages|components|lib|prisma|server|src)/') {
    $RequiresFull = $true
    $Reason = "application/runtime path changed outside owner UI lane"
  } elseif ($Normalized -match '^(app/api|pages/api)/') {
    $RequiresFull = $true
    $Reason = "API route changed"
  } elseif ($Normalized -match '^(tools/hx2-quick-verify\.ps1|tools/guard-hx2-syntax\.ps1|tools/hx2-verify-policy\.ps1|tools/hx2-verify-auto\.ps1|tools/hx2-owner-ui-verify\.ps1)$') {
    $RequiresFull = $true
    $Reason = "verification safety surface changed"
  }

  if ($RequiresFull) {
    $FullReasons += [pscustomobject]@{
      Path = $Normalized
      Reason = $Reason
    }
  } elseif ($IsOwnerUiLane) {
    $OwnerUiReasons += [pscustomobject]@{
      Path = $Normalized
      Reason = $Reason
    }
  } else {
    $FastReasons += [pscustomobject]@{
      Path = $Normalized
      Reason = "low-risk tooling/docs/log/status surface"
    }
  }
}

Write-Host ""
Write-Host "AUTO VERIFY CHANGE CLASSIFICATION" -ForegroundColor Cyan

@($FullReasons + $OwnerUiReasons + $FastReasons) |
  Sort-Object Path |
  Format-Table Path, Reason -AutoSize

Write-Host ""

if (@($FullReasons).Count -gt 0) {
  Write-Host "AUTO VERIFY DECISION: FULL REQUIRED" -ForegroundColor Yellow

  if ($DryRun) {
    Write-Host "DRY RUN: would run npm run hx2:quick:compact"
    exit 0
  }

  Write-Host "Running: npm run hx2:quick:compact"
  powershell -NoProfile -ExecutionPolicy Bypass -File $QuickVerify -Compact
  exit $LASTEXITCODE
}

if (@($OwnerUiReasons).Count -gt 0 -and @($FastReasons).Count -eq 0) {
  Write-Host "AUTO VERIFY DECISION: OWNER UI LANE" -ForegroundColor Green

  if ($DryRun) {
    Write-Host "DRY RUN: would run npm run hx2:verify:owner-ui"
    exit 0
  }

  Write-Host "Running: npm run hx2:verify:owner-ui"
  powershell -NoProfile -ExecutionPolicy Bypass -File $OwnerUiVerify
  exit $LASTEXITCODE
}

if (@($OwnerUiReasons).Count -gt 0 -and @($FastReasons).Count -gt 0) {
  Write-Host "AUTO VERIFY DECISION: FULL REQUIRED" -ForegroundColor Yellow
  Write-Host "Reason: owner UI changes are mixed with other low-risk files; use full gate to avoid ambiguous coverage."

  if ($DryRun) {
    Write-Host "DRY RUN: would run npm run hx2:quick:compact"
    exit 0
  }

  powershell -NoProfile -ExecutionPolicy Bypass -File $QuickVerify -Compact
  exit $LASTEXITCODE
}

Write-Host "AUTO VERIFY DECISION: FAST OK" -ForegroundColor Green

if ($DryRun) {
  Write-Host "DRY RUN: would run npm run hx2:quick:fast:compact"
  exit 0
}

Write-Host "Running: npm run hx2:quick:fast:compact"
powershell -NoProfile -ExecutionPolicy Bypass -File $QuickVerify -Compact -Fast
exit $LASTEXITCODE
