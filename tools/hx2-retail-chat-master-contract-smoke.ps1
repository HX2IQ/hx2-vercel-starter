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
Write-Host "== HX2 RETAIL CHAT-MASTER CONTRACT BRIDGE SMOKE ==" -ForegroundColor Cyan
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
    return ($Value | ConvertTo-Json -Depth 50)
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

function Test-Hx2LocalContract {
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

  if ($Missing.Count -eq 0) {
    return [pscustomobject]@{
      Check = $Path
      Status = "GREEN"
      Detail = "markers found"
    }
  }

  return [pscustomobject]@{
    Check = $Path
    Status = "YELLOW"
    Detail = "missing: $($Missing -join ', ')"
  }
}

function Test-Hx2ContractEnvelope {
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

  $Contract = $Envelope.contract

  if (-not $Contract) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing contract object"
    }
  }

  $Required = @(
    "answer",
    "mode",
    "route",
    "request_id",
    "participation",
    "warnings",
    "safe_metadata"
  )

  $Missing = @()

  foreach ($Key in $Required) {
    if (-not ($Contract.PSObject.Properties.Name -contains $Key)) {
      $Missing += $Key
    }
  }

  if ($Missing.Count -gt 0) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "missing contract keys: $($Missing -join ', ')"
    }
  }

  if ([string]::IsNullOrWhiteSpace([string]$Contract.answer)) {
    return [pscustomobject]@{
      Check = $Label
      Status = "YELLOW"
      Detail = "contract answer empty"
    }
  }

  $Participation = $Contract.participation
  $Metadata = $Contract.safe_metadata

  $ParticipationOk = (
    $Participation.PSObject.Properties.Name -contains "retrieval" -and
    $Participation.PSObject.Properties.Name -contains "orchestrator" -and
    $Participation.PSObject.Properties.Name -contains "kgx" -and
    $Participation.PSObject.Properties.Name -contains "signals"
  )

  $MetadataOk = (
    $Metadata.PSObject.Properties.Name -contains "contract_version" -and
    $Metadata.PSObject.Properties.Name -contains "no_brain_logic" -and
    $Metadata.PSObject.Properties.Name -contains "no_internal_prompts" -and
    $Metadata.PSObject.Properties.Name -contains "no_internal_weights"
  )

  if (-not $ParticipationOk) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "participation contract incomplete"
    }
  }

  if (-not $MetadataOk) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Detail = "safe metadata contract incomplete"
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Detail = "retail chat-master bridge contract valid"
  }
}

Write-Host ""
Write-Host "LOCAL BRIDGE CONTRACTS" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\retail-chat-contract.ts" -Markers @("buildHx2RetailChatContract", "safe_metadata")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\chat-master\route.ts" -Markers @("POST")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\retail-chat-master-contract-preview\route.ts" -Markers @("CHAT_MASTER_ROUTE", "buildHx2RetailChatContract", "safe_metadata_only_no_brain_logic")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE BRIDGE SURFACE" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{
    Check = "GET /api/hx2/retail-chat-master-contract-preview"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "POST /api/hx2/retail-chat-master-contract-preview"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
} else {
  $Url = "$Base/api/hx2/retail-chat-master-contract-preview"

  try {
    $GetResponse = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30
    $LiveRows += Test-Hx2ContractEnvelope -Label "GET /api/hx2/retail-chat-master-contract-preview" -Envelope $GetResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET /api/hx2/retail-chat-master-contract-preview"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  $PostPayload = @{
    message = "HX2 retail bridge smoke. Give one short public safe-preview status sentence."
    mode = "safe_preview"
    request_id = "hx2-retail-chat-master-bridge-smoke"
    readOnly = $true
    dryRun = $true
    noPersist = $true
  } | ConvertTo-Json -Depth 20

  try {
    $PostResponse = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $PostPayload -TimeoutSec 60
    $LiveRows += Test-Hx2ContractEnvelope -Label "POST /api/hx2/retail-chat-master-contract-preview" -Envelope $PostResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "POST /api/hx2/retail-chat-master-contract-preview"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CHAT-MASTER BRIDGE RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves chat-master can be exposed through the retail-safe contract bridge."
  Next = "After this is live green, wire UI/chat-master consumers to prefer the retail contract."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat-master bridge smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail chat-master bridge strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat-master contract bridge smoke complete" -ForegroundColor Green
