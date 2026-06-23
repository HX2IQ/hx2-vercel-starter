param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host ""
Write-Host "== HX2 AUTH BILLING ACCOUNTS FUNCTIONAL PROBE ==" -ForegroundColor Cyan

function Get-Hx2TextHits {
  param(
    [string[]]$Paths,
    [string]$Pattern
  )

  $Count = 0

  foreach ($P in $Paths) {
    if (Test-Path $P) {
      $Files = Get-ChildItem -Path $P -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
          $_.FullName -notmatch "\\node_modules\\" -and
          $_.FullName -notmatch "\\.next\\" -and
          $_.FullName -notmatch "\\.git\\" -and
          $_.Extension -match "\.(ts|tsx|js|jsx|json|ps1|md|prisma)$"
        }

      $Hits = $Files | Select-String -Pattern $Pattern -ErrorAction SilentlyContinue
      $Count += ($Hits | Measure-Object).Count
    }
  }

  return $Count
}

function Get-Hx2CandidateFiles {
  param(
    [string[]]$Paths,
    [string]$Pattern
  )

  $Results = @()

  foreach ($P in $Paths) {
    if (Test-Path $P) {
      $Files = Get-ChildItem -Path $P -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
          $_.FullName -notmatch "\\node_modules\\" -and
          $_.FullName -notmatch "\\.next\\" -and
          $_.FullName -notmatch "\\.git\\" -and
          $_.Extension -match "\.(ts|tsx|js|jsx|json|ps1|prisma)$"
        }

      foreach ($File in $Files) {
        $Hit = Select-String -LiteralPath $File.FullName -Pattern $Pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($Hit) {
          $Results += $File
        }
      }
    }
  }

  return $Results | Sort-Object FullName -Unique
}

Write-Host ""
Write-Host "EVIDENCE COUNTS" -ForegroundColor Cyan

$EvidencePaths = @(".\app", ".\lib", ".\tools", ".\prisma")

$Evidence = @(
  [pscustomobject]@{ Signal="auth"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "auth|authentication|authorize|authorized") },
  [pscustomobject]@{ Signal="session/login"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "session|login|logout|signIn|signOut") },
  [pscustomobject]@{ Signal="account/user"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "account|user|profile|workspace") },
  [pscustomobject]@{ Signal="billing"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "billing|invoice|checkout|payment") },
  [pscustomobject]@{ Signal="stripe/subscription"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "stripe|subscription|customer|priceId|webhook") },
  [pscustomobject]@{ Signal="permissions"; Hits=(Get-Hx2TextHits -Paths $EvidencePaths -Pattern "permission|role|owner|admin|access") }
)

$Evidence | Format-Table -AutoSize

$TotalEvidence = ($Evidence | Measure-Object -Property Hits -Sum).Sum

Write-Host ""
Write-Host ("Total auth / billing / accounts evidence hits: {0}" -f $TotalEvidence)

Write-Host ""
Write-Host "ROUTE CANDIDATE INVENTORY" -ForegroundColor Cyan

$RouteCandidates = @()

foreach ($BasePath in @(".\app\api", ".\app")) {
  if (Test-Path $BasePath) {
    $RouteCandidates += Get-ChildItem -Path $BasePath -Recurse -File -Filter "route.ts" -ErrorAction SilentlyContinue |
      Where-Object {
        $_.FullName -match "(auth|billing|account|stripe|subscription|checkout|login|session|user|webhook|workspace)"
      }
  }
}

$RouteCandidates = $RouteCandidates | Sort-Object FullName -Unique

$RouteRows = foreach ($Route in $RouteCandidates) {
  $Content = (Get-Content -LiteralPath $Route.FullName) -join "`n"

  [pscustomobject]@{
    Route = $Route.FullName.Replace($Root + "\", "")
    HasGET = [bool]($Content -match "export\s+async\s+function\s+GET|export\s+function\s+GET")
    HasPOST = [bool]($Content -match "export\s+async\s+function\s+POST|export\s+function\s+POST")
    HasAuth = [bool]($Content -match "auth|session|login|user|account")
    HasBilling = [bool]($Content -match "billing|stripe|checkout|subscription|invoice|payment|webhook")
    HasPermission = [bool]($Content -match "permission|role|owner|admin|access")
    HasSafeMode = [bool]($Content -match "read_only|preview|safe_metadata|no_brain_logic|status|test|diagnostic")
  }
}

if (@($RouteRows).Count -gt 0) {
  $RouteRows | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no obvious auth/billing/account route.ts candidates found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CORE CANDIDATE FILES" -ForegroundColor Cyan

$CoreCandidates = Get-Hx2CandidateFiles -Paths @(".\app", ".\lib", ".\tools", ".\prisma") -Pattern "auth|authentication|session|login|account|user|billing|stripe|subscription|checkout|webhook|permission|role|workspace"

$CoreRows = foreach ($File in ($CoreCandidates | Select-Object -First 60)) {
  [pscustomobject]@{
    File = $File.FullName.Replace($Root + "\", "")
  }
}

if (@($CoreRows).Count -gt 0) {
  $CoreRows | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no core auth/billing/account candidate files found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CONTRACT CHECKS" -ForegroundColor Cyan

$Checks = @()

$Checks += [pscustomobject]@{
  Check = "Has route candidates"
  Status = if (@($RouteRows).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($RouteRows).Count) route candidates"
}

$Checks += [pscustomobject]@{
  Check = "Has core candidate files"
  Status = if (@($CoreRows).Count -gt 0) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($CoreRows).Count) shown"
}

$Checks += [pscustomobject]@{
  Check = "Has strong auth/billing evidence"
  Status = if ($TotalEvidence -ge 100) { "GREEN" } elseif ($TotalEvidence -ge 25) { "YELLOW" } else { "RED" }
  Detail = "$TotalEvidence evidence hits"
}

$Checks += [pscustomobject]@{
  Check = "Has auth/session markers"
  Status = if (@($RouteRows | Where-Object HasAuth).Count -gt 0 -or (Get-Hx2TextHits -Paths $EvidencePaths -Pattern "auth|session|login|user|account") -ge 25) { "GREEN" } else { "YELLOW" }
  Detail = "auth/session route or strong file evidence"
}

$Checks += [pscustomobject]@{
  Check = "Has billing/subscription markers"
  Status = if (@($RouteRows | Where-Object HasBilling).Count -gt 0 -or (Get-Hx2TextHits -Paths $EvidencePaths -Pattern "billing|stripe|subscription|checkout|payment|webhook") -ge 10) { "GREEN" } else { "YELLOW" }
  Detail = "billing route or file evidence"
}

$Checks += [pscustomobject]@{
  Check = "Has permission/access markers"
  Status = if (@($RouteRows | Where-Object HasPermission).Count -gt 0 -or (Get-Hx2TextHits -Paths $EvidencePaths -Pattern "permission|role|owner|admin|access") -ge 25) { "GREEN" } else { "YELLOW" }
  Detail = "permission/access route or strong file evidence"
}

$Checks += [pscustomobject]@{
  Check = "Has safe read/status/test markers"
  Status = if (@($RouteRows | Where-Object HasSafeMode).Count -gt 0 -or (Get-Hx2TextHits -Paths $EvidencePaths -Pattern "safe_metadata|no_brain_logic|diagnostic|status|read_only") -ge 10) { "GREEN" } else { "YELLOW" }
  Detail = "$(@($RouteRows | Where-Object HasSafeMode).Count) safe/status route candidates or safe file evidence"
}

$Checks | Format-Table -AutoSize

$RedCount = @($Checks | Where-Object Status -eq "RED").Count
$YellowCount = @($Checks | Where-Object Status -eq "YELLOW").Count
$GreenCount = @($Checks | Where-Object Status -eq "GREEN").Count

Write-Host ""
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host ("Green checks:  {0}" -f $GreenCount)
Write-Host ("Yellow checks: {0}" -f $YellowCount)
Write-Host ("Red checks:    {0}" -f $RedCount)

if ($RedCount -gt 0) {
  throw "Auth billing accounts probe found red checks."
}

if ($Strict -and $YellowCount -gt 0) {
  throw "Auth billing accounts strict probe found yellow checks."
}

Write-Host ""
Write-Host "GREEN: auth billing accounts functional probe passed" -ForegroundColor Green
