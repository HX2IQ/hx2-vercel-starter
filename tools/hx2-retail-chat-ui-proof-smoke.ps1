param(
  [string]$Base = "",
  [switch]$LocalOnly,
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

if ([string]::IsNullOrWhiteSpace($Base)) {
  $Base = "https://optinodeiq.com"
}

$Base = $Base.TrimEnd("/")

Write-Host ""
Write-Host "== HX2 RETAIL CHAT UI PROOF SMOKE ==" -ForegroundColor Cyan
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

function Test-Hx2LocalMarkers {
  param(
    [string]$Path,
    [string[]]$Markers
  )

  $Text = Get-Hx2Text -Path $Path

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return [pscustomobject]@{ Check = $Path; Status = "RED"; Detail = "missing or empty" }
  }

  $Missing = @()
  foreach ($Marker in $Markers) {
    if ($Text -notmatch [regex]::Escape($Marker)) {
      $Missing += $Marker
    }
  }

  if ($Missing.Count -gt 0) {
    return [pscustomobject]@{ Check = $Path; Status = "YELLOW"; Detail = "missing: $($Missing -join ', ')" }
  }

  return [pscustomobject]@{ Check = $Path; Status = "GREEN"; Detail = "markers found" }
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
    return [pscustomobject]@{ Status = "RED"; Detail = "internal leak marker(s): $($Hits -join ', ')" }
  }

  return [pscustomobject]@{ Status = "GREEN"; Detail = "no internal leak markers" }
}

Write-Host ""
Write-Host "LOCAL UI PROOF FILES" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\hx2-retail-chat-proof\page.tsx" -Markers @("HX2 Retail Chat UI Proof", "retail-chat-consumer-preference", "retail-chat-master-contract-preview")
$LocalRows += Test-Hx2LocalMarkers -Path ".\app\hx2-retail-chat-proof\Hx2RetailChatProofClient.tsx" -Markers @("sendHx2RetailChatMessage", "data-hx2-retail-chat-ui-button", "retail_chat_contract_v1")
$LocalRows += Test-Hx2LocalMarkers -Path ".\lib\hx2-retail-chat-client.ts" -Markers @("sendHx2RetailChatMessage", "getHx2RetailChatConsumerPreference", "retail_chat_contract_v1")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE UI PROOF SURFACES" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{ Check = "GET /hx2-retail-chat-proof"; Status = "SKIPPED"; Detail = "local-only mode" }
  $LiveRows += [pscustomobject]@{ Check = "GET consumer preference"; Status = "SKIPPED"; Detail = "local-only mode" }
  $LiveRows += [pscustomobject]@{ Check = "POST preferred retail chat bridge"; Status = "SKIPPED"; Detail = "local-only mode" }
} else {
  try {
    $Page = Invoke-WebRequest -Uri "$Base/hx2-retail-chat-proof" -Method GET -TimeoutSec 30 -UseBasicParsing
    $PageText = [string]$Page.Content
    $Leak = Test-Hx2NoInternalLeak -Text $PageText

    if ($Leak.Status -eq "RED") {
      $LiveRows += [pscustomobject]@{ Check = "GET /hx2-retail-chat-proof"; Status = "RED"; Detail = $Leak.Detail }
    } elseif ($PageText -match "HX2 Retail Chat UI Proof" -and $PageText -match "retail_chat_contract_v1") {
      $LiveRows += [pscustomobject]@{ Check = "GET /hx2-retail-chat-proof"; Status = "GREEN"; Detail = "page shell markers found" }
    } else {
      $LiveRows += [pscustomobject]@{ Check = "GET /hx2-retail-chat-proof"; Status = "YELLOW"; Detail = "page responded but expected shell markers missing" }
    }
  } catch {
    $LiveRows += [pscustomobject]@{ Check = "GET /hx2-retail-chat-proof"; Status = "RED"; Detail = $_.Exception.Message }
  }

  try {
    $Preference = Invoke-RestMethod -Uri "$Base/api/hx2/retail-chat-consumer-preference" -Method GET -TimeoutSec 30
    if ($Preference.preference.preferred_endpoint -eq "/api/hx2/retail-chat-master-contract-preview") {
      $LiveRows += [pscustomobject]@{ Check = "GET consumer preference"; Status = "GREEN"; Detail = "preferred endpoint available" }
    } else {
      $LiveRows += [pscustomobject]@{ Check = "GET consumer preference"; Status = "RED"; Detail = "preferred endpoint mismatch" }
    }
  } catch {
    $LiveRows += [pscustomobject]@{ Check = "GET consumer preference"; Status = "RED"; Detail = $_.Exception.Message }
  }

  try {
    $Payload = @{
      message = "HX2 retail UI proof smoke. Return one short public safe-preview status sentence."
      request_id = "hx2-retail-ui-proof-smoke"
      mode = "safe_preview"
      readOnly = $true
      dryRun = $true
      noPersist = $true
    } | ConvertTo-Json -Depth 20

    $Bridge = Invoke-RestMethod -Uri "$Base/api/hx2/retail-chat-master-contract-preview" -Method POST -ContentType "application/json" -Body $Payload -TimeoutSec 60

    if ($Bridge.contract.safe_metadata.contract_version -eq "retail_chat_contract_v1" -and $Bridge.contract.answer) {
      $LiveRows += [pscustomobject]@{ Check = "POST preferred retail chat bridge"; Status = "GREEN"; Detail = "preferred bridge returned retail contract" }
    } else {
      $LiveRows += [pscustomobject]@{ Check = "POST preferred retail chat bridge"; Status = "RED"; Detail = "retail contract missing or malformed" }
    }
  } catch {
    $LiveRows += [pscustomobject]@{ Check = "POST preferred retail chat bridge"; Status = "RED"; Detail = $_.Exception.Message }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CHAT UI PROOF RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves an isolated UI page can consume the retail-safe chat contract path."
  Next = "After live green, wire the main chat UI to the retail chat client helper."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat UI proof smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail chat UI proof strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat UI proof smoke complete" -ForegroundColor Green
