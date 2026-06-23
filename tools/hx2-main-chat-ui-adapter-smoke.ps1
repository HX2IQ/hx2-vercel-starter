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
Write-Host "== HX2 MAIN CHAT UI ADAPTER SMOKE ==" -ForegroundColor Cyan
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
    return ($Value | ConvertTo-Json -Depth 80)
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

function Test-Hx2AdapterEnvelope {
  param(
    [string]$Label,
    $Envelope,
    [switch]$RequireResult
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

  if (-not $Envelope.adapter) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing adapter object"
    }
  }

  if ($Envelope.adapter.adapter_version -ne "main_chat_ui_retail_adapter_v1") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "adapter version mismatch"
    }
  }

  if ($Envelope.adapter.preferred_client -ne "retail_chat_client_v1") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "preferred client mismatch"
    }
  }

  if ($Envelope.adapter.preferred_contract -ne "retail_chat_contract_v1") {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "preferred contract mismatch"
    }
  }

  if ($RequireResult) {
    if (-not $Envelope.result) {
      return [pscustomobject]@{
        Check = $Label
        Status = "RED"
        Detail = "missing result object"
      }
    }

    if ([string]::IsNullOrWhiteSpace([string]$Envelope.result.answer)) {
      return [pscustomobject]@{
        Check = $Label
        Status = "YELLOW"
        Detail = "result answer empty"
      }
    }

    if ($Envelope.result.preferred_contract -ne "retail_chat_contract_v1") {
      return [pscustomobject]@{
        Check = $Label
        Status = "RED"
        Detail = "result preferred contract mismatch"
      }
    }

    if (-not $Envelope.result.participation) {
      return [pscustomobject]@{
        Check = $Label
        Status = "RED"
        Detail = "missing result participation"
      }
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Detail = "main chat UI adapter proof valid"
  }
}

Write-Host ""
Write-Host "LOCAL MAIN CHAT UI ADAPTER FILES" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalMarkers -Path ".\lib\hx2-main-chat-ui-adapter.ts" -Markers @("sendHx2MainChatUiMessage", "retail_chat_client_v1", "retail_chat_contract_v1", "no_raw_chat_master_display")
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\api\hx2\main-chat-ui-adapter-proof\route.ts" -Markers @("sendHx2MainChatUiMessage", "getHx2MainChatUiAdapterConfig", "safe_metadata_only_no_brain_logic")
$LocalRows += Test-Hx2LocalMarkers -Path ".\lib\hx2-retail-chat-client.ts" -Markers @("sendHx2RetailChatMessage", "getHx2RetailChatConsumerPreference", "retail_chat_contract_v1")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE MAIN CHAT UI ADAPTER SURFACES" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{
    Check = "GET /api/hx2/main-chat-ui-adapter-proof"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "POST /api/hx2/main-chat-ui-adapter-proof"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "GET retail chat UI proof page"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
} else {
  try {
    $GetEnvelope = Invoke-RestMethod -Uri "$Base/api/hx2/main-chat-ui-adapter-proof" -Method GET -TimeoutSec 30
    $LiveRows += Test-Hx2AdapterEnvelope -Label "GET /api/hx2/main-chat-ui-adapter-proof" -Envelope $GetEnvelope
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET /api/hx2/main-chat-ui-adapter-proof"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  try {
    $Payload = @{
      message = "HX2 main chat UI adapter smoke. Return one short public safe-preview status sentence."
      request_id = "hx2-main-chat-ui-adapter-smoke"
    } | ConvertTo-Json -Depth 20

    $PostEnvelope = Invoke-RestMethod -Uri "$Base/api/hx2/main-chat-ui-adapter-proof" -Method POST -ContentType "application/json" -Body $Payload -TimeoutSec 60
    $LiveRows += Test-Hx2AdapterEnvelope -Label "POST /api/hx2/main-chat-ui-adapter-proof" -Envelope $PostEnvelope -RequireResult
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "POST /api/hx2/main-chat-ui-adapter-proof"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  try {
    $Page = Invoke-WebRequest -Uri "$Base/hx2-retail-chat-proof" -Method GET -TimeoutSec 30 -UseBasicParsing
    $PageText = [string]$Page.Content
    $Leak = Test-Hx2NoInternalLeak -Text $PageText

    if ($Leak.Status -eq "RED") {
      $LiveRows += [pscustomobject]@{
        Check = "GET retail chat UI proof page"
        Status = "RED"
        Detail = $Leak.Detail
      }
    } elseif ($PageText -match "HX2 Retail Chat UI Proof") {
      $LiveRows += [pscustomobject]@{
        Check = "GET retail chat UI proof page"
        Status = "GREEN"
        Detail = "existing retail UI proof page still available"
      }
    } else {
      $LiveRows += [pscustomobject]@{
        Check = "GET retail chat UI proof page"
        Status = "YELLOW"
        Detail = "page responded but expected marker missing"
      }
    }
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET retail chat UI proof page"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "MAIN CHAT UI ADAPTER RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves the main chat UI now has a guarded retail-safe adapter layer."
  Next = "After live green, patch the actual main chat component to import/use this adapter."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Main chat UI adapter smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Main chat UI adapter strict smoke found yellow checks."
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
Write-Host "GREEN: main chat UI adapter smoke complete" -ForegroundColor Green
