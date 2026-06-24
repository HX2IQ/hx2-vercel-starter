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
Write-Host "== HX2 EMBEDDED CHAT WIRING SMOKE ==" -ForegroundColor Cyan
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

function New-Hx2Row {
  param(
    [string]$Check,
    [string]$Status,
    [string]$Detail
  )

  return [pscustomobject]@{
    Check = $Check
    Status = $Status
    Detail = $Detail
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
    return "internal leak marker(s): $($Hits -join ', ')"
  }

  return ""
}

Write-Host ""
Write-Host "LOCAL EMBEDDED CHAT WIRING" -ForegroundColor Cyan

$Rows = @()
$File = ".\app\components\EmbeddedOIChat.tsx"
$Text = Get-Hx2Text -Path $File

if ([string]::IsNullOrWhiteSpace($Text)) {
  $Rows += New-Hx2Row -Check "EmbeddedOIChat exists" -Status "RED" -Detail "missing or empty"
} else {
  $Rows += New-Hx2Row -Check "EmbeddedOIChat exists" -Status "GREEN" -Detail "found app/components/EmbeddedOIChat.tsx"

  if ($Text -match [regex]::Escape("sendHx2MainChatUiMessage")) {
    $Rows += New-Hx2Row -Check "Adapter send path" -Status "GREEN" -Detail "uses sendHx2MainChatUiMessage"
  } else {
    $Rows += New-Hx2Row -Check "Adapter send path" -Status "RED" -Detail "missing sendHx2MainChatUiMessage"
  }

  if ($Text -match 'fetch\("/api/hx2/chat-master"') {
    $Rows += New-Hx2Row -Check "Direct chat-master fetch" -Status "RED" -Detail "still directly fetches /api/hx2/chat-master"
  } else {
    $Rows += New-Hx2Row -Check "Direct chat-master fetch" -Status "GREEN" -Detail "direct chat-master fetch removed"
  }

  if ($Text -match [regex]::Escape("Embedded HealthOI chat context.") -and $Text -match [regex]::Escape("modeHint") -and $Text -match [regex]::Escape("nodeHint")) {
    $Rows += New-Hx2Row -Check "HealthOI intent preserved" -Status "GREEN" -Detail "modeHint and nodeHint still used"
  } else {
    $Rows += New-Hx2Row -Check "HealthOI intent preserved" -Status "RED" -Detail "HealthOI intent markers missing"
  }

  if ($Text -match [regex]::Escape("setMessages([") -and $Text -match [regex]::Escape("adapterResult.answer")) {
    $Rows += New-Hx2Row -Check "UI answer display" -Status "GREEN" -Detail "adapter answer flows into embedded chat messages"
  } else {
    $Rows += New-Hx2Row -Check "UI answer display" -Status "RED" -Detail "adapter answer display markers missing"
  }
}

$Rows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE RETAIL-SAFE ADAPTER SURFACES" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "SKIPPED" -Detail "local-only mode"
  $LiveRows += New-Hx2Row -Check "POST adapter proof" -Status "SKIPPED" -Detail "local-only mode"
} else {
  try {
    $Preference = Invoke-RestMethod -Uri "$Base/api/hx2/retail-chat-consumer-preference" -Method GET -TimeoutSec 30
    $PreferenceJson = $Preference | ConvertTo-Json -Depth 20
    $Leak = Test-Hx2NoInternalLeak -Text $PreferenceJson

    if ($Leak) {
      $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "RED" -Detail $Leak
    } elseif ($PreferenceJson -match "retail_chat_contract_v1" -and $PreferenceJson -match "/api/hx2/retail-chat-master-contract-preview") {
      $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "GREEN" -Detail "consumer preference points to retail contract endpoint"
    } else {
      $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "RED" -Detail "missing expected retail endpoint or contract"
    }
  } catch {
    $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "RED" -Detail $_.Exception.Message
  }

  try {
    $Payload = @{
      message = "Embedded HealthOI chat smoke. Prefer AH3 health context if relevant. Return one short retail-safe public status sentence."
      request_id = "hx2-embedded-chat-wiring-smoke"
    } | ConvertTo-Json -Depth 20

    $Adapter = Invoke-RestMethod -Uri "$Base/api/hx2/main-chat-ui-adapter-proof" -Method POST -ContentType "application/json" -Body $Payload -TimeoutSec 60
    $AdapterJson = $Adapter | ConvertTo-Json -Depth 20
    $Leak = Test-Hx2NoInternalLeak -Text $AdapterJson

    if ($Leak) {
      $LiveRows += New-Hx2Row -Check "POST adapter proof" -Status "RED" -Detail $Leak
    } elseif ($AdapterJson -match "retail_chat_contract_v1" -and $AdapterJson -match "answer") {
      $LiveRows += New-Hx2Row -Check "POST adapter proof" -Status "GREEN" -Detail "adapter proof returned retail-safe answer"
    } else {
      $LiveRows += New-Hx2Row -Check "POST adapter proof" -Status "RED" -Detail "adapter proof missing answer or contract marker"
    }
  } catch {
    $LiveRows += New-Hx2Row -Check "POST adapter proof" -Status "RED" -Detail $_.Exception.Message
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "EMBEDDED CHAT WIRING RESULT" -ForegroundColor Cyan

$AllRows = @($Rows + $LiveRows)
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
  Meaning = "This proves the embedded HealthOI chat no longer calls chat-master directly and now uses the retail-safe adapter path."
  Next = "After green, add direct endpoint cleanup report or browser automation."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Embedded chat wiring smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Embedded chat wiring strict smoke found yellow checks."
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
Write-Host "GREEN: embedded chat wiring smoke complete" -ForegroundColor Green
