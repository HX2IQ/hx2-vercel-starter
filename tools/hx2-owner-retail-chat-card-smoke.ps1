param(
  [string]$Base = "",
  [switch]$LocalOnly
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
Write-Host "== HX2 OWNER RETAIL CHAT VERIFICATION CARD SMOKE ==" -ForegroundColor Cyan
Write-Host ("Base:       {0}" -f $Base)
Write-Host ("Local only: {0}" -f [bool]$LocalOnly)

function New-Row {
  param(
    [string]$Check,
    [string]$Status,
    [string]$Detail
  )

  [pscustomobject]@{
    Check = $Check
    Status = $Status
    Detail = $Detail
  }
}

function Test-NoLeak {
  param([string]$Text)

  $Forbidden = @(
    "SYSTEM_PROMPT:",
    "DEVELOPER_MESSAGE:",
    "CHAIN_OF_THOUGHT:",
    "PRIVATE_REASONING:",
    "INTERNAL_WEIGHTS:",
    "SCORING_WEIGHTS:",
    "CONFLUENCE_WEIGHTS:",
    "__SYSTEM_PROMPT__",
    "__DEVELOPER_MESSAGE__",
    "nodeWeights",
    "scoringWeights",
    "confluenceWeights",
    "developerMessage",
    "systemPrompt"
  )

  foreach ($Term in $Forbidden) {
    if ($Text -match [regex]::Escape($Term)) {
      return "leak marker found: $Term"
    }
  }

  return ""
}

$Rows = @()

Write-Host ""
Write-Host "LOCAL OWNER STATUS CHECKS" -ForegroundColor Cyan

$OwnerRoute = ".\app\api\hx2\owner-status\route.ts"
$RetailRoute = ".\app\api\hx2\retail-chat-verify-status\route.ts"

$OwnerText = Get-Content $OwnerRoute -Raw
$RetailText = Get-Content $RetailRoute -Raw

if ($OwnerText -match 'id: "retail-chat-verify-bundle"') {
  $Rows += New-Row "Owner surface id" "GREEN" "retail-chat-verify-bundle found"
} else {
  $Rows += New-Row "Owner surface id" "RED" "retail-chat-verify-bundle missing"
}

if ($OwnerText -match "npm run hx2:retail-chat:verify") {
  $Rows += New-Row "Owner command" "GREEN" "retail chat verify command found"
} else {
  $Rows += New-Row "Owner command" "RED" "retail chat verify command missing"
}

if ($OwnerText -match "checks:\s*10") {
  $Rows += New-Row "Owner check count" "GREEN" "checks: 10 found"
} else {
  $Rows += New-Row "Owner check count" "RED" "checks: 10 missing"
}

if ($OwnerText -match "guarded_preflight_ready") {
  $Rows += New-Row "Owner safety posture" "GREEN" "guarded_preflight_ready found"
} else {
  $Rows += New-Row "Owner safety posture" "RED" "guarded_preflight_ready missing"
}

if ($RetailText -match "retail_chat_browser_proof_prep" -and $RetailText -match "retail_chat_negative_error_state_smoke") {
  $Rows += New-Row "Retail status upgraded checks" "GREEN" "10-check retail status markers found"
} else {
  $Rows += New-Row "Retail status upgraded checks" "RED" "10-check retail status markers missing"
}

if ($LocalOnly) {
  $Rows += New-Row "Live owner-status API" "SKIPPED" "local-only mode"
  $Rows += New-Row "Live retail-chat status API" "SKIPPED" "local-only mode"
} else {
  Write-Host ""
  Write-Host "LIVE OWNER STATUS CHECKS" -ForegroundColor Cyan

  try {
    $Owner = Invoke-RestMethod -Uri "$Base/api/hx2/owner-status" -Method GET -TimeoutSec 75
    $OwnerJson = $Owner | ConvertTo-Json -Depth 40
    $Leak = Test-NoLeak $OwnerJson

    if ($Leak) {
      $Rows += New-Row "Live owner-status API" "RED" $Leak
    } elseif (
      $OwnerJson -match "retail-chat-verify-bundle" -and
      $OwnerJson -match "npm run hx2:retail-chat:verify" -and
      $OwnerJson -match "guarded_preflight_ready"
    ) {
      $Rows += New-Row "Live owner-status API" "GREEN" "owner status exposes retail chat verification card"
    } else {
      $Rows += New-Row "Live owner-status API" "RED" "retail chat verification card metadata missing"
    }
  } catch {
    $Rows += New-Row "Live owner-status API" "RED" $_.Exception.Message
  }

  try {
    $Retail = Invoke-RestMethod -Uri "$Base/api/hx2/retail-chat-verify-status" -Method GET -TimeoutSec 75
    $RetailJson = $Retail | ConvertTo-Json -Depth 40
    $Leak = Test-NoLeak $RetailJson

    if ($Leak) {
      $Rows += New-Row "Live retail-chat status API" "RED" $Leak
    } elseif (
      $RetailJson -match "npm run hx2:retail-chat:verify" -and
      $RetailJson -match "retail_chat_browser_proof_prep" -and
      $RetailJson -match "retail_chat_negative_error_state_smoke"
    ) {
      $Rows += New-Row "Live retail-chat status API" "GREEN" "retail chat status exposes upgraded 10-check bundle"
    } else {
      $Rows += New-Row "Live retail-chat status API" "RED" "upgraded retail chat status metadata missing"
    }
  } catch {
    $Rows += New-Row "Live retail-chat status API" "RED" $_.Exception.Message
  }
}

Write-Host ""
Write-Host "OWNER RETAIL CHAT VERIFICATION CARD RESULT" -ForegroundColor Cyan

$Rows | Format-Table -AutoSize

$Green = @($Rows | Where-Object Status -eq "GREEN").Count
$Red = @($Rows | Where-Object Status -eq "RED").Count
$Skipped = @($Rows | Where-Object Status -eq "SKIPPED").Count
$Total = @($Rows).Count

[pscustomobject]@{
  Green = "$Green / $Total"
  Red = "$Red / $Total"
  Skipped = "$Skipped / $Total"
  Meaning = "Owner status exposes the retail chat 10-check verification bundle as safe metadata."
  Next = "Keep npm run hx2:retail-chat:verify as the default chat/UI preflight."
} | Format-List

if ($Red -gt 0) {
  $Rows | Where-Object Status -eq "RED" | Format-List
  throw "Owner retail chat verification card smoke found red checks."
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
Write-Host "GREEN: owner retail chat verification card smoke complete" -ForegroundColor Green
