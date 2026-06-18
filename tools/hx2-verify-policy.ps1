param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 VERIFY POLICY ==" -ForegroundColor Cyan

$StatusLines = git status --porcelain

if (-not $StatusLines -or @($StatusLines).Count -eq 0) {
  Write-Host "GREEN: working tree clean" -ForegroundColor Green
  Write-Host "Recommended verify: none required unless you want a fresh confidence check."
  exit 0
}

$FullReasons = @()
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

foreach ($Line in $StatusLines) {
  $Path = Get-Hx2ChangedPath -StatusLine $Line
  $Normalized = $Path -replace "\\", "/"

  $RequiresFull = $false
  $Reason = ""

  if ($Normalized -match '(^|/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$') {
    $RequiresFull = $true
    $Reason = "package/dependency/script surface changed"
  } elseif ($Normalized -match '(^|/)(tsconfig\.json|next\.config\.(js|mjs|ts)|middleware\.(ts|js)|prisma/schema\.prisma)$') {
    $RequiresFull = $true
    $Reason = "compiler/runtime/config surface changed"
  } elseif ($Normalized -match '\.(ts|tsx|js|jsx|mjs|cjs)$') {
    $RequiresFull = $true
    $Reason = "code file changed"
  } elseif ($Normalized -match '^(app|pages|components|lib|prisma|server|src)/') {
    $RequiresFull = $true
    $Reason = "application/runtime path changed"
  } elseif ($Normalized -match '^(app/api|pages/api)/') {
    $RequiresFull = $true
    $Reason = "API route changed"
  } elseif ($Normalized -match '^(tools/hx2-quick-verify\.ps1|tools/guard-hx2-syntax\.ps1|tools/hx2-verify-policy\.ps1)$') {
    $RequiresFull = $true
    $Reason = "verification safety surface changed"
  }

  if ($RequiresFull) {
    $FullReasons += [pscustomobject]@{
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
Write-Host "CHANGED FILES" -ForegroundColor Cyan

@($FullReasons + $FastReasons) |
  Sort-Object Path |
  Format-Table Path, Reason -AutoSize

Write-Host ""

if (@($FullReasons).Count -gt 0) {
  Write-Host "VERIFY POLICY: FULL REQUIRED" -ForegroundColor Yellow
  Write-Host "Run this before commit/push:" -ForegroundColor Yellow
  Write-Host "npm run hx2:quick:compact"
  Write-Host ""
  Write-Host "Reason: one or more changes affect code, routes, package scripts, config, or verification safety."

  if ($Strict) {
    exit 2
  }

  exit 0
}

Write-Host "VERIFY POLICY: FAST OK FOR ITERATION" -ForegroundColor Green
Write-Host "Run during iteration:" -ForegroundColor Green
Write-Host "npm run hx2:quick:fast:compact"
Write-Host ""
Write-Host "Recommended before final commit/push if unsure:" -ForegroundColor Yellow
Write-Host "npm run hx2:quick:compact"

exit 0
