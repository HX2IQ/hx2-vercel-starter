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
Write-Host "== HX2 RETAIL CHAT CONSUMER PREFERENCE SMOKE ==" -ForegroundColor Cyan
Write-Host ("Base:       {0}" -f $Base)
Write-Host ("Local only: {0}" -f [bool]$LocalOnly)
Write-Host ("Strict:     {0}" -f [bool]$Strict)

function Get-Hx2Text {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }

  return (Get-Content -LiteralPath $Path) -join "`n"
}

function Convert-Hx2ObjectToText {
  param($Value)

  try {
    return ($Value | ConvertTo-Json -Depth 60)
  } catch {
    return [string]$Value
  }
}

function Test-Hx2NoInternalLeak {
  param([string]$Text)

  $Forbidden = @(
    "SYSTEM_PROMPT:",
    "DEVELOPER_MESSAGE:",
    "HIDDEN_PROMPT:",
    "CHAIN_OF_THOUGHT:",
    "PRIVATE_REASONING:",
    "INTERNAL_WEIGHTS:",
    "SCORING_WEIGHTS:",
    "CONFLUENCE_WEIGHTS:",
    "__INTERNAL_PROMPT__",
    "__SYSTEM_PROMPT__",
    "__DEVELOPER_MESSAGE__",
    "nodeWeights",
    "scoringWeights",
    "confluenceWeights",
    "developerMessage",
    "systemPrompt"
  )

  $Hits = @()

  foreach ($Term in $Forbidden) {
    if ($Text -match [regex]::Escape($Term)) {
      $Hits += $Term
    }
  }

  if ($Hits.Count -gt 0) {
    return [pscustomobject]@{
      Status = "RED"
      Detail = "internal leak marker(s): $($Hits -join ', ')"
    }
  }

  return [pscustomobject]@{
    Status = "GREEN"
    Detail = "no internal leak markers"
  }
}

function Test-Hx2LocalMarkers {
  param(
    [string]$Path,
    [string[]]$Markers
  )

  $Text = Get-Hx2Text -Path $Path

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return [pscustomobject]@{
      Check = $Path
      Status = "RED"
      Detail = "missing or empty"
    }
  }

  $Missing = @()

  foreach ($Marker in $Markers) {
    if ($Text -notmatch [regex]::Escape($Marker)) {
      $Missing += $Marker
    }
  }

  if ($Missing.Count -gt 0) {
    return [pscustomobject]@{
      Check = $Path
      Status = "YELLOW"
      Detail = "missing: $($Missing -join ', ')"
    }
  }

  return [pscustomobject]@{
    Check = $Path
    Status = "GREEN"
    Detail = "markers found"
  }
}

function Test-Hx2PreferenceEnvelope {
  param(
    [string]$Label,
    $Envelope
  )

  $Text = Convert-Hx2ObjectToText -Value $Envelope
  $Leak = Test-Hx2NoInternalLeak -Text $Text

  if ($Leak.Status -eq "RED") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = $Leak.Detail
    }
  }

  $Preference = $Envelope.preference

  if (-not $Preference) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing preference object"
    }
  }

  $Required = @(
    "preferred_endpoint",
    "preferred_contract",
    "fallback_endpoints",
    "deprecated_direct_endpoints",
    "consumer_rules",
    "display_contract",
    "warnings"
  )

  $Missing = @()

  foreach ($Key in $Required) {
    if (-not ($Preference.PSObject.Properties.Name -contains $Key)) {
      $Missing += $Key
    }
  }

  if ($Missing.Count -gt 0) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing preference keys: $($Missing -join ', ')"
    }
  }

  if ($Preference.preferred_endpoint -ne "/api/hx2/retail-chat-master-contract-preview") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "wrong preferred endpoint: $($Preference.preferred_endpoint)"
    }
  }

  if ($Preference.preferred_contract -ne "retail_chat_contract_v1") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "wrong preferred contract: $($Preference.preferred_contract)"
    }
  }

  $Rules = $Preference.consumer_rules
  $Display = $Preference.display_contract

  $RulesOk = (
    $Rules.PSObject.Properties.Name -contains "prefer_retail_contract" -and
    $Rules.PSObject.Properties.Name -contains "require_answer_field" -and
    $Rules.PSObject.Properties.Name -contains "require_participation_object" -and
    $Rules.PSObject.Properties.Name -contains "require_safe_metadata" -and
    $Rules.PSObject.Properties.Name -contains "no_brain_logic" -and
    $Rules.PSObject.Properties.Name -contains "no_internal_prompts" -and
    $Rules.PSObject.Properties.Name -contains "no_internal_weights"
  )

  $DisplayOk = (
    $Display.PSObject.Properties.Name -contains "answer_path" -and
    $Display.PSObject.Properties.Name -contains "participation_path" -and
    $Display.PSObject.Properties.Name -contains "safe_metadata_path"
  )

  if (-not $RulesOk) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "consumer rules incomplete"
    }
  }

  if (-not $DisplayOk) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "display contract incomplete"
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Detail = "consumer preference contract valid"
  }
}

Write-Host ""
Write-Host "LOCAL CONSUMER PREFERENCE FILES" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\api\hx2\_lib\retail-chat-consumer-preference.ts" -Markers @("preferred_endpoint", "retail-chat-master-contract-preview", "display_contract", "no_brain_logic")
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\api\hx2\retail-chat-consumer-preference\route.ts" -Markers @("GET", "buildHx2RetailChatConsumerPreference", "safe_metadata_only_no_brain_logic")
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\api\hx2\retail-chat-master-contract-preview\route.ts" -Markers @("CHAT_MASTER_ROUTE", "buildHx2RetailChatContract")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE CONSUMER PREFERENCE SURFACE" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{
    Check = "GET /api/hx2/retail-chat-consumer-preference"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "GET preferred retail chat-master bridge"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
} else {
  $PreferenceUrl = "$Base/api/hx2/retail-chat-consumer-preference"

  try {
    $PreferenceResponse = Invoke-RestMethod -Uri $PreferenceUrl -Method GET -TimeoutSec 30
    $LiveRows += Test-Hx2PreferenceEnvelope -Label "GET /api/hx2/retail-chat-consumer-preference" -Envelope $PreferenceResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET /api/hx2/retail-chat-consumer-preference"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  $BridgeUrl = "$Base/api/hx2/retail-chat-master-contract-preview"

  try {
    $BridgeResponse = Invoke-RestMethod -Uri $BridgeUrl -Method GET -TimeoutSec 30
    $BridgeText = Convert-Hx2ObjectToText -Value $BridgeResponse
    $Leak = Test-Hx2NoInternalLeak -Text $BridgeText

    if ($Leak.Status -eq "RED") {
      $LiveRows += [pscustomobject]@{
        Check = "GET preferred retail chat-master bridge"
        Status = "RED"
        Detail = $Leak.Detail
      }
    } elseif (-not $BridgeResponse.contract) {
      $LiveRows += [pscustomobject]@{
        Check = "GET preferred retail chat-master bridge"
        Status = "RED"
        Detail = "missing contract object"
      }
    } else {
      $LiveRows += [pscustomobject]@{
        Check = "GET preferred retail chat-master bridge"
        Status = "GREEN"
        Detail = "preferred bridge live and contract-shaped"
      }
    }
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET preferred retail chat-master bridge"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CONSUMER PREFERENCE RESULT" -ForegroundColor Cyan

$AllRows = @($LocalRows + $LiveRows)
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
  Meaning = "This proves UI/product consumers have a safe preferred retail chat contract endpoint."
  Next = "After live green, wire an actual UI component or chat client to consume this preference."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail consumer preference smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail consumer preference strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat consumer preference smoke complete" -ForegroundColor Green
