$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETAIL MVP READINESS PANEL ==" -ForegroundColor Cyan
Write-Host "Mode: local repo readiness gate"
Write-Host "Secrets printed: false"

function Test-AnyFileSignal {
  param([string[]]$Patterns)

  $Roots = @(".\app", ".\components", ".\lib", ".\tools") | Where-Object { Test-Path $_ }

  foreach ($Root in $Roots) {
    $Found = Get-ChildItem $Root -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {
        $Path = $_.FullName
        foreach ($Pattern in $Patterns) {
          if ($Path -match $Pattern) {
            return $true
          }
        }
        return $false
      } |
      Select-Object -First 1

    if ($Found) {
      return $true
    }
  }

  return $false
}

function Test-PackageScript {
  param([string]$Name)

  if (-not (Test-Path ".\package.json")) {
    return $false
  }

  $Package = Get-Content ".\package.json" -Raw | ConvertFrom-Json
  if (-not $Package.scripts) {
    return $false
  }

  return [bool]($Package.scripts.PSObject.Properties.Name -contains $Name)
}

function New-ReadinessRow {
  param(
    [string]$Lane,
    [string]$Status,
    [string]$Risk,
    [string]$Evidence,
    [string]$NextAction
  )

  [pscustomobject]@{
    Lane = $Lane
    Status = $Status
    Risk = $Risk
    Evidence = $Evidence
    NextAction = $NextAction
  }
}

$Rows = @()

$HasChatMaster = Test-Path ".\app\api\hx2\chat-master\route.ts"
$HasRetrievalTrust =
  (Test-Path ".\tools\retrieval-quality\hx2-retrieval-quality-verify-bundle.ps1") -and
  (Test-Path ".\tools\retrieval-quality-smoke.ps1")
$HasSourceEvidence = Test-AnyFileSignal @("source-evidence", "source evidence")
$HasSpeedCloseout = Test-Path ".\tools\GUARD-RUNNER-SPEED-LAYER-CLOSEOUT.md"
$HasTeamMode =
  (Test-Path ".\tools\DEV2-TEAM-BUILD-ACCELERATOR-CHARTER.md") -and
  (Test-PackageScript "dev2:team:preview")
$HasOwnerConsole = Test-AnyFileSignal @("owner", "console", "dashboard", "status")
$HasPricingBilling = Test-AnyFileSignal @("pricing", "checkout", "stripe", "billing", "subscription")
$HasAuth = Test-AnyFileSignal @("auth", "login", "signup", "session", "account", "user")
$HasOnboarding = Test-AnyFileSignal @("onboarding", "first-run", "getting-started", "welcome")

$Rows += New-ReadinessRow "Core chat-master API" $(if ($HasChatMaster) { "GREEN" } else { "RED" }) "medium" $(if ($HasChatMaster) { "chat-master route exists" } else { "chat-master route missing" }) "Keep protected by benchmark and retrieval gates."
$Rows += New-ReadinessRow "Retrieval trust gate" $(if ($HasRetrievalTrust) { "GREEN" } else { "RED" }) "medium" $(if ($HasRetrievalTrust) { "strict retrieval verify and smoke files exist" } else { "retrieval verification missing" }) "Keep strict trust active."
$Rows += New-ReadinessRow "Source evidence contract" $(if ($HasSourceEvidence) { "GREEN" } else { "YELLOW" }) "medium" $(if ($HasSourceEvidence) { "source evidence signals exist" } else { "source evidence signals incomplete" }) "Preserve source_evidence fields."
$Rows += New-ReadinessRow "Verify speed layer" $(if ($HasSpeedCloseout) { "GREEN" } else { "YELLOW" }) "low" $(if ($HasSpeedCloseout) { "Phase 2.18 closeout exists" } else { "speed closeout missing" }) "Use fast verify during iteration and full verify for release."
$Rows += New-ReadinessRow "DEV2 team execution mode" $(if ($HasTeamMode) { "GREEN" } else { "YELLOW" }) "low" $(if ($HasTeamMode) { "team mode evidence exists" } else { "team mode evidence incomplete" }) "Use team preview before bundled patches."
$Rows += New-ReadinessRow "Owner console" $(if ($HasOwnerConsole) { "GREEN" } else { "YELLOW" }) "low-medium" $(if ($HasOwnerConsole) { "owner/console/status signals exist" } else { "owner console signals weak" }) "Next low-risk UI/control patch candidate."
$Rows += New-ReadinessRow "Pricing / billing" $(if ($HasPricingBilling) { "YELLOW" } else { "RED" }) "high" $(if ($HasPricingBilling) { "billing/pricing signals exist; money flow not verified here" } else { "billing/pricing scaffolding not found" }) "Do not expand until release gate and auth posture are clear."
$Rows += New-ReadinessRow "Auth / accounts" $(if ($HasAuth) { "YELLOW" } else { "RED" }) "high" $(if ($HasAuth) { "auth/account signals exist; security posture not verified here" } else { "auth/account scaffolding not found" }) "Handle in micro-sprints only."
$Rows += New-ReadinessRow "Onboarding / first-run" $(if ($HasOnboarding) { "YELLOW" } else { "RED" }) "low" $(if ($HasOnboarding) { "onboarding signals exist" } else { "no onboarding/first-run signals found" }) "Good next conversion patch after release gate is visible."

$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
$Yellow = @($Rows | Where-Object { $_.Status -eq "YELLOW" }).Count
$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

Write-Host ""
Write-Host "RETAIL MVP READINESS MATRIX" -ForegroundColor Cyan
$Rows | Format-Table Lane, Status, Risk, Evidence -AutoSize

Write-Host ""
Write-Host "RETAIL MVP READINESS SUMMARY" -ForegroundColor Cyan
[pscustomobject]@{
  Green = $Green
  Yellow = $Yellow
  Red = $Red
  Meaning = "GREEN means usable evidence exists; YELLOW means scaffold/signals exist but release confidence is incomplete; RED means missing or not yet visible."
} | Format-List

Write-Host ""
Write-Host "NEXT ACTIONS" -ForegroundColor Cyan
$Rows | Select-Object Lane, NextAction | Format-Table -AutoSize

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "YELLOW: Retail MVP has open readiness gaps. This is expected before paid launch." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "GREEN: Retail MVP readiness panel completed."

