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
Write-Host "== HX2 RETAIL CHAT CLIENT HELPER SMOKE ==" -ForegroundColor Cyan
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

  if (-not $Envelope.preference) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing preference"
    }
  }

  if ($Envelope.preference.preferred_endpoint -ne "/api/hx2/retail-chat-master-contract-preview") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "wrong preferred endpoint: $($Envelope.preference.preferred_endpoint)"
    }
  }

  if ($Envelope.preference.preferred_contract -ne "retail_chat_contract_v1") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "wrong preferred contract: $($Envelope.preference.preferred_contract)"
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Detail = "consumer preference valid"
  }
}

function Test-Hx2RetailChatEnvelope {
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

  if (-not $Envelope.contract) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing contract"
    }
  }

  if ([string]::IsNullOrWhiteSpace([string]$Envelope.contract.answer)) {
    return [pscustomobject]@{
      Check = $Label
      Status = "YELLOW"
      Detail = "contract answer empty"
    }
  }

  if ($Envelope.contract.safe_metadata.contract_version -ne "retail_chat_contract_v1") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "contract version mismatch"
    }
  }

  if (-not $Envelope.contract.participation) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing participation"
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Detail = "retail chat envelope valid"
  }
}

Write-Host ""
Write-Host "LOCAL CLIENT HELPER CONTRACTS" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalMarkers -Path ".\lib\hx2-retail-chat-client.ts" -Markers @("sendHx2RetailChatMessage", "getHx2RetailChatConsumerPreference", "retail_chat_contract_v1", "safe_metadata")
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\api\hx2\retail-chat-consumer-preference\route.ts" -Markers @("buildHx2RetailChatConsumerPreference")
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\api\hx2\retail-chat-master-contract-preview\route.ts" -Markers @("CHAT_MASTER_ROUTE", "buildHx2RetailChatContract")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE CLIENT HELPER TARGETS" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{
    Check = "GET consumer preference"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "POST preferred retail chat bridge"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
} else {
  $PreferenceUrl = "$Base/api/hx2/retail-chat-consumer-preference"

  try {
    $PreferenceResponse = Invoke-RestMethod -Uri $PreferenceUrl -Method GET -TimeoutSec 30
    $LiveRows += Test-Hx2PreferenceEnvelope -Label "GET consumer preference" -Envelope $PreferenceResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET consumer preference"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  $BridgeUrl = "$Base/api/hx2/retail-chat-master-contract-preview"

  $Payload = @{
    message = "HX2 retail client helper smoke. Return one short public safe-preview status sentence."
    request_id = "hx2-retail-client-helper-smoke"
    mode = "safe_preview"
    readOnly = $true
    dryRun = $true
    noPersist = $true
  } | ConvertTo-Json -Depth 20

  try {
    $BridgeResponse = Invoke-RestMethod -Uri $BridgeUrl -Method POST -ContentType "application/json" -Body $Payload -TimeoutSec 60
    $LiveRows += Test-Hx2RetailChatEnvelope -Label "POST preferred retail chat bridge" -Envelope $BridgeResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "POST preferred retail chat bridge"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CHAT CLIENT HELPER RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves the UI-safe helper contract targets are available and client-consumable."
  Next = "After live green, wire a low-risk UI component to this helper."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat client helper smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail chat client helper strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat client helper smoke complete" -ForegroundColor Green
