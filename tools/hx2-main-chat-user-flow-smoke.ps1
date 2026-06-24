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
Write-Host "== HX2 MAIN CHAT USER-FLOW SMOKE ==" -ForegroundColor Cyan
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
Write-Host "LOCAL CHAT USER-FLOW MARKERS" -ForegroundColor Cyan

$Rows = @()
$ChatFile = ".\app\chat\ChatClient.tsx"
$ChatText = Get-Hx2Text -Path $ChatFile

if ([string]::IsNullOrWhiteSpace($ChatText)) {
  $Rows += New-Hx2Row -Check "ChatClient exists" -Status "RED" -Detail "missing or empty"
} else {
  $Rows += New-Hx2Row -Check "ChatClient exists" -Status "GREEN" -Detail "found app/chat/ChatClient.tsx"

  if ($ChatText -match [regex]::Escape("sendHx2MainChatUiMessage")) {
    $Rows += New-Hx2Row -Check "Adapter send path" -Status "GREEN" -Detail "uses sendHx2MainChatUiMessage"
  } else {
    $Rows += New-Hx2Row -Check "Adapter send path" -Status "RED" -Detail "missing sendHx2MainChatUiMessage"
  }

  if ($ChatText -match 'const res = await fetch\("/api/hx2/chat"') {
    $Rows += New-Hx2Row -Check "Direct raw chat fetch" -Status "RED" -Detail "main send path still directly fetches /api/hx2/chat"
  } else {
    $Rows += New-Hx2Row -Check "Direct raw chat fetch" -Status "GREEN" -Detail "direct /api/hx2/chat fetch removed from main send path"
  }

  if ($ChatText -match [regex]::Escape("<textarea") -and $ChatText -match [regex]::Escape("onKeyDown={onKeyDown}")) {
    $Rows += New-Hx2Row -Check "User input control" -Status "GREEN" -Detail "textarea and Enter handler present"
  } else {
    $Rows += New-Hx2Row -Check "User input control" -Status "RED" -Detail "textarea or Enter handler missing"
  }

  if ($ChatText -match [regex]::Escape("onClick={send}") -and $ChatText -match [regex]::Escape("disabled={!canSend}")) {
    $Rows += New-Hx2Row -Check "Send button control" -Status "GREEN" -Detail "send button is wired and disabled safely"
  } else {
    $Rows += New-Hx2Row -Check "Send button control" -Status "RED" -Detail "send button marker missing"
  }

  if ($ChatText -match [regex]::Escape("retail_contract") -and $ChatText -match [regex]::Escape("main_chat_ui_adapter")) {
    $Rows += New-Hx2Row -Check "Retail-safe display payload" -Status "GREEN" -Detail "adapter metadata stored in safe debug payload"
  } else {
    $Rows += New-Hx2Row -Check "Retail-safe display payload" -Status "RED" -Detail "retail-safe adapter payload markers missing"
  }
}

$Rows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE USER-FLOW SURFACES" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += New-Hx2Row -Check "GET /chat" -Status "SKIPPED" -Detail "local-only mode"
  $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "SKIPPED" -Detail "local-only mode"
  $LiveRows += New-Hx2Row -Check "POST adapter proof" -Status "SKIPPED" -Detail "local-only mode"
} else {
  try {
    $Page = Invoke-WebRequest -Uri "$Base/chat" -Method GET -TimeoutSec 30 -UseBasicParsing
    $PageText = [string]$Page.Content
    $Leak = Test-Hx2NoInternalLeak -Text $PageText

    if ($Leak) {
      $LiveRows += New-Hx2Row -Check "GET /chat" -Status "RED" -Detail $Leak
    } elseif ($Page.StatusCode -ge 200 -and $Page.StatusCode -lt 400) {
      $LiveRows += New-Hx2Row -Check "GET /chat" -Status "GREEN" -Detail "chat page reachable and leak-safe"
    } else {
      $LiveRows += New-Hx2Row -Check "GET /chat" -Status "RED" -Detail "unexpected HTTP status $($Page.StatusCode)"
    }
  } catch {
    $LiveRows += New-Hx2Row -Check "GET /chat" -Status "RED" -Detail $_.Exception.Message
  }

  try {
    $Preference = Invoke-RestMethod -Uri "$Base/api/hx2/retail-chat-consumer-preference" -Method GET -TimeoutSec 30
    $PreferenceJson = $Preference | ConvertTo-Json -Depth 20

    if ($PreferenceJson -match "retail_chat_contract_v1" -and $PreferenceJson -match "/api/hx2/retail-chat-master-contract-preview") {
      $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "GREEN" -Detail "consumer preference points to retail contract endpoint"
    } else {
      $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "RED" -Detail "consumer preference missing expected retail endpoint/contract"
    }
  } catch {
    $LiveRows += New-Hx2Row -Check "GET consumer preference" -Status "RED" -Detail $_.Exception.Message
  }

  try {
    $Payload = @{
      message = "HX2 main chat user-flow smoke. Return one short public retail-safe status sentence."
      request_id = "hx2-main-chat-user-flow-smoke"
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
Write-Host "MAIN CHAT USER-FLOW RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves the main /chat user-flow path is reachable, wired through the retail adapter, and leak-safe at the deterministic smoke level."
  Next = "Add secondary embedded chat adapter wiring or add Playwright/browser automation if dependency policy allows."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Main chat user-flow smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Main chat user-flow strict smoke found yellow checks."
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
Write-Host "GREEN: main chat user-flow smoke complete" -ForegroundColor Green
