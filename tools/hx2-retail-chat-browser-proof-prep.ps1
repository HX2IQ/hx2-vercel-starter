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
Write-Host "== HX2 RETAIL CHAT BROWSER-PROOF PREP SMOKE ==" -ForegroundColor Cyan
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
    "systemPrompt",
    "private_reasoning",
    "hidden_chain"
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

function Invoke-Hx2GetText {
  param([string]$Url)

  try {
    $Response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 45
    return [pscustomobject]@{
      StatusCode = [int]$Response.StatusCode
      Body = [string]$Response.Content
      Error = ""
    }
  } catch {
    $StatusCode = 0
    $Body = ""

    if ($_.Exception.Response) {
      try {
        $StatusCode = [int]$_.Exception.Response.StatusCode
      } catch {
        $StatusCode = 0
      }
    }

    return [pscustomobject]@{
      StatusCode = $StatusCode
      Body = $Body
      Error = $_.Exception.Message
    }
  }
}

Write-Host ""
Write-Host "LOCAL /CHAT UI SOURCE MARKERS" -ForegroundColor Cyan

$Rows = @()

$ChatClient = ".\app\chat\ChatClient.tsx"
$ChatText = Get-Hx2Text -Path $ChatClient

if ([string]::IsNullOrWhiteSpace($ChatText)) {
  $Rows += New-Hx2Row -Check "Main chat client exists" -Status "RED" -Detail "missing app/chat/ChatClient.tsx"
} else {
  $Rows += New-Hx2Row -Check "Main chat client exists" -Status "GREEN" -Detail "found app/chat/ChatClient.tsx"

  if ($ChatText -match "sendHx2MainChatUiMessage") {
    $Rows += New-Hx2Row -Check "Retail adapter marker" -Status "GREEN" -Detail "main chat uses sendHx2MainChatUiMessage"
  } else {
    $Rows += New-Hx2Row -Check "Retail adapter marker" -Status "RED" -Detail "main chat missing sendHx2MainChatUiMessage"
  }

  if ($ChatText -match 'fetch\s*\(\s*["'']\/api\/hx2\/chat') {
    $Rows += New-Hx2Row -Check "Direct chat endpoint bypass" -Status "RED" -Detail "main chat still has direct /api/hx2/chat fetch"
  } elseif ($ChatText -match 'fetch\s*\(\s*["'']\/api\/hx2\/chat-master') {
    $Rows += New-Hx2Row -Check "Direct chat-master bypass" -Status "RED" -Detail "main chat still has direct /api/hx2/chat-master fetch"
  } else {
    $Rows += New-Hx2Row -Check "Direct endpoint bypass" -Status "GREEN" -Detail "no direct chat/chat-master fetch marker in main chat client"
  }

  if ($ChatText -match "textarea") {
    $Rows += New-Hx2Row -Check "Textarea marker" -Status "GREEN" -Detail "textarea marker found"
  } else {
    $Rows += New-Hx2Row -Check "Textarea marker" -Status "RED" -Detail "textarea marker missing"
  }

  if ($ChatText -match "<button" -or $ChatText -match "button") {
    $Rows += New-Hx2Row -Check "Send button marker" -Status "GREEN" -Detail "button marker found"
  } else {
    $Rows += New-Hx2Row -Check "Send button marker" -Status "RED" -Detail "button marker missing"
  }

  if ($ChatText -match "onKeyDown" -and $ChatText -match "Enter") {
    $Rows += New-Hx2Row -Check "Enter-to-send marker" -Status "GREEN" -Detail "onKeyDown and Enter markers found"
  } else {
    $Rows += New-Hx2Row -Check "Enter-to-send marker" -Status "YELLOW" -Detail "Enter-to-send markers incomplete"
  }

  if ($ChatText -match "disabled") {
    $Rows += New-Hx2Row -Check "Send disabled-state marker" -Status "GREEN" -Detail "disabled marker found"
  } else {
    $Rows += New-Hx2Row -Check "Send disabled-state marker" -Status "YELLOW" -Detail "disabled marker not found"
  }
}

$Adapter = ".\lib\hx2-main-chat-ui-adapter.ts"
$AdapterText = Get-Hx2Text -Path $Adapter

if ($AdapterText -match "retail_chat_contract_v1" -or $AdapterText -match "sendHx2RetailChatMessage") {
  $Rows += New-Hx2Row -Check "Main chat adapter helper" -Status "GREEN" -Detail "adapter helper has retail contract/client markers"
} else {
  $Rows += New-Hx2Row -Check "Main chat adapter helper" -Status "RED" -Detail "adapter helper markers missing"
}

$ProofPage = ".\app\hx2-retail-chat-proof\page.tsx"
$ProofClient = ".\app\hx2-retail-chat-proof\Hx2RetailChatProofClient.tsx"

if ((Test-Path -LiteralPath $ProofPage) -or (Test-Path -LiteralPath $ProofClient)) {
  $Rows += New-Hx2Row -Check "Isolated retail proof page source" -Status "GREEN" -Detail "proof page source exists"
} else {
  $Rows += New-Hx2Row -Check "Isolated retail proof page source" -Status "YELLOW" -Detail "proof page source not found"
}

$Bundle = ".\tools\hx2-retail-chat-verification-bundle.ps1"
$BundleText = Get-Hx2Text -Path $Bundle

if ($BundleText -match "Retail chat negative/error-state" -and $BundleText -match "hx2:retail-chat:negative") {
  $Rows += New-Hx2Row -Check "Retail verify bundle is 9-check capable" -Status "GREEN" -Detail "negative/error-state marker found in bundle"
} else {
  $Rows += New-Hx2Row -Check "Retail verify bundle is 9-check capable" -Status "RED" -Detail "negative/error-state marker missing from bundle"
}

$Rows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE BROWSER-PREP SURFACES" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += New-Hx2Row -Check "GET /chat" -Status "SKIPPED" -Detail "local-only mode"
  $LiveRows += New-Hx2Row -Check "GET /hx2-retail-chat-proof" -Status "SKIPPED" -Detail "local-only mode"
  $LiveRows += New-Hx2Row -Check "GET /api/hx2/retail-chat-verify-status" -Status "SKIPPED" -Detail "local-only mode"
} else {
  $ChatPage = Invoke-Hx2GetText -Url "$Base/chat"
  $Leak = Test-Hx2NoInternalLeak -Text $ChatPage.Body

  if ($ChatPage.StatusCode -ge 200 -and $ChatPage.StatusCode -lt 300 -and [string]::IsNullOrWhiteSpace($Leak)) {
    $LiveRows += New-Hx2Row -Check "GET /chat" -Status "GREEN" -Detail "page reachable and no leak markers"
  } elseif (-not [string]::IsNullOrWhiteSpace($Leak)) {
    $LiveRows += New-Hx2Row -Check "GET /chat" -Status "RED" -Detail $Leak
  } else {
    $LiveRows += New-Hx2Row -Check "GET /chat" -Status "RED" -Detail "status=$($ChatPage.StatusCode) error=$($ChatPage.Error)"
  }

  $Proof = Invoke-Hx2GetText -Url "$Base/hx2-retail-chat-proof"
  $Leak = Test-Hx2NoInternalLeak -Text $Proof.Body

  if ($Proof.StatusCode -ge 200 -and $Proof.StatusCode -lt 300 -and [string]::IsNullOrWhiteSpace($Leak)) {
    $LiveRows += New-Hx2Row -Check "GET /hx2-retail-chat-proof" -Status "GREEN" -Detail "proof page reachable and no leak markers"
  } elseif ($Proof.StatusCode -eq 404) {
    $LiveRows += New-Hx2Row -Check "GET /hx2-retail-chat-proof" -Status "YELLOW" -Detail "proof page not deployed or route not present"
  } elseif (-not [string]::IsNullOrWhiteSpace($Leak)) {
    $LiveRows += New-Hx2Row -Check "GET /hx2-retail-chat-proof" -Status "RED" -Detail $Leak
  } else {
    $LiveRows += New-Hx2Row -Check "GET /hx2-retail-chat-proof" -Status "RED" -Detail "status=$($Proof.StatusCode) error=$($Proof.Error)"
  }

  $Status = Invoke-Hx2GetText -Url "$Base/api/hx2/retail-chat-verify-status"
  $Leak = Test-Hx2NoInternalLeak -Text $Status.Body

  if ($Status.StatusCode -ge 200 -and $Status.StatusCode -lt 300 -and $Status.Body -match "retail_chat_negative_error_state_smoke" -and [string]::IsNullOrWhiteSpace($Leak)) {
    $LiveRows += New-Hx2Row -Check "GET /api/hx2/retail-chat-verify-status" -Status "GREEN" -Detail "safe metadata route advertises upgraded bundle"
  } elseif (-not [string]::IsNullOrWhiteSpace($Leak)) {
    $LiveRows += New-Hx2Row -Check "GET /api/hx2/retail-chat-verify-status" -Status "RED" -Detail $Leak
  } else {
    $LiveRows += New-Hx2Row -Check "GET /api/hx2/retail-chat-verify-status" -Status "RED" -Detail "missing upgraded bundle marker or route failed"
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CHAT BROWSER-PROOF PREP RESULT" -ForegroundColor Cyan

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
  Meaning = "This is browser-automation prep: it proves reachable browser surfaces and local UI markers before adding Playwright-level interaction."
  Next = "If green, add this prep smoke to the retail chat verification bundle or move to Playwright/browser automation."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat browser-proof prep smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail chat browser-proof prep strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat browser-proof prep smoke complete" -ForegroundColor Green
