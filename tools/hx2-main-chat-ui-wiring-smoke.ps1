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
Write-Host "== HX2 MAIN CHAT UI WIRING SMOKE ==" -ForegroundColor Cyan
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

function Test-Hx2MainChatLocal {
  $Path = ".\app\chat\ChatClient.tsx"
  $Text = Get-Hx2Text -Path $Path

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return [pscustomobject]@{
      Check = $Path
      Status = "RED"
      Detail = "missing or empty"
    }
  }

  if ($Text -match 'const res = await fetch\("/api/hx2/chat"') {
    return [pscustomobject]@{
      Check = $Path
      Status = "RED"
      Detail = "main send path still uses direct /api/hx2/chat fetch"
    }
  }

  $Required = @(
    "sendHx2MainChatUiMessage",
    "main_chat_ui_adapter",
    "retail_contract",
    "adapterResult.answer"
  )

  $Missing = @()

  foreach ($Marker in $Required) {
    if ($Text -notmatch [regex]::Escape($Marker)) {
      $Missing += $Marker
    }
  }

  if ($Missing.Count -gt 0) {
    return [pscustomobject]@{
      Check = $Path
      Status = "YELLOW"
      Detail = "missing marker(s): $($Missing -join ', ')"
    }
  }

  return [pscustomobject]@{
    Check = $Path
    Status = "GREEN"
    Detail = "main chat UI send path uses adapter"
  }
}

Write-Host ""
Write-Host "LOCAL MAIN CHAT UI WIRING" -ForegroundColor Cyan

$Rows = @()
$Rows += Test-Hx2MainChatLocal

$AdapterText = Get-Hx2Text -Path ".\lib\hx2-main-chat-ui-adapter.ts"
if ($AdapterText -match "sendHx2MainChatUiMessage" -and $AdapterText -match "retail_chat_contract_v1") {
  $Rows += [pscustomobject]@{
    Check = "lib/hx2-main-chat-ui-adapter.ts"
    Status = "GREEN"
    Detail = "adapter ready"
  }
} else {
  $Rows += [pscustomobject]@{
    Check = "lib/hx2-main-chat-ui-adapter.ts"
    Status = "RED"
    Detail = "adapter markers missing"
  }
}

$Rows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE MAIN CHAT UI SURFACES" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{
    Check = "GET /chat"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "POST adapter proof"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
} else {
  try {
    $Page = Invoke-WebRequest -Uri "$Base/chat" -Method GET -TimeoutSec 30 -UseBasicParsing
    $PageText = [string]$Page.Content
    $Leak = Test-Hx2NoInternalLeak -Text $PageText

    if ($Leak.Status -eq "RED") {
      $LiveRows += [pscustomobject]@{
        Check = "GET /chat"
        Status = "RED"
        Detail = $Leak.Detail
      }
    } elseif ($Page.StatusCode -ge 200 -and $Page.StatusCode -lt 400) {
      $LiveRows += [pscustomobject]@{
        Check = "GET /chat"
        Status = "GREEN"
        Detail = "chat page reachable"
      }
    } else {
      $LiveRows += [pscustomobject]@{
        Check = "GET /chat"
        Status = "RED"
        Detail = "unexpected status $($Page.StatusCode)"
      }
    }
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET /chat"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  try {
    $Payload = @{
      message = "HX2 main chat UI wiring smoke. Return one short public safe-preview status sentence."
      request_id = "hx2-main-chat-ui-wiring-smoke"
    } | ConvertTo-Json -Depth 20

    $Adapter = Invoke-RestMethod -Uri "$Base/api/hx2/main-chat-ui-adapter-proof" -Method POST -ContentType "application/json" -Body $Payload -TimeoutSec 60

    if ($Adapter.result.preferred_contract -eq "retail_chat_contract_v1" -and $Adapter.result.answer) {
      $LiveRows += [pscustomobject]@{
        Check = "POST adapter proof"
        Status = "GREEN"
        Detail = "adapter proof returned retail contract answer"
      }
    } else {
      $LiveRows += [pscustomobject]@{
        Check = "POST adapter proof"
        Status = "RED"
        Detail = "adapter proof missing retail contract answer"
      }
    }
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "POST adapter proof"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "MAIN CHAT UI WIRING RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves the main /chat UI send path is wired to the retail-safe adapter layer."
  Next = "After live green, patch secondary embedded chat surfaces or add browser-level E2E."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Main chat UI wiring smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Main chat UI wiring strict smoke found yellow checks."
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
Write-Host "GREEN: main chat UI wiring smoke complete" -ForegroundColor Green
