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
Write-Host "== HX2 RETAIL CHAT CONTRACT SMOKE ==" -ForegroundColor Cyan
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
    return ($Value | ConvertTo-Json -Depth 40)
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

function Test-Hx2ContractObject {
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
      Detail = "missing keys: $($Missing -join ', ')"
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

  if ([string]::IsNullOrWhiteSpace([string]$Contract.answer)) {
    return [pscustomobject]@{
      Check = $Label
      Status = "YELLOW"
      Detail = "answer is empty"
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Detail = "retail chat contract shape valid"
  }
}

Write-Host ""
Write-Host "LOCAL CONTRACT FILES" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\retail-chat-contract.ts" -Markers @("Hx2RetailChatContract", "participation", "safe_metadata", "no_brain_logic")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\retail-chat-contract-preview\route.ts" -Markers @("GET", "POST", "buildHx2RetailChatContract", "safe_metadata_only_no_brain_logic")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE CONTRACT SURFACE" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += [pscustomobject]@{
    Check = "GET /api/hx2/retail-chat-contract-preview"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
  $LiveRows += [pscustomobject]@{
    Check = "POST /api/hx2/retail-chat-contract-preview"
    Status = "SKIPPED"
    Detail = "local-only mode"
  }
} else {
  $GetUrl = "$Base/api/hx2/retail-chat-contract-preview"

  try {
    $GetResponse = Invoke-RestMethod -Uri $GetUrl -Method GET -TimeoutSec 30
    $LiveRows += Test-Hx2ContractObject -Label "GET /api/hx2/retail-chat-contract-preview" -Envelope $GetResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "GET /api/hx2/retail-chat-contract-preview"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }

  $PostPayload = @{
    answer = "HX2 safe preview chat path is responding through the retail contract surface."
    mode = "safe_preview"
    request_id = "hx2-retail-contract-smoke"
    retrieval = "retrieval source marker"
    orchestrator = "orchestrator route marker"
    kgx = "kgx graph context marker"
  } | ConvertTo-Json -Depth 20

  try {
    $PostResponse = Invoke-RestMethod -Uri $GetUrl -Method POST -ContentType "application/json" -Body $PostPayload -TimeoutSec 30
    $LiveRows += Test-Hx2ContractObject -Label "POST /api/hx2/retail-chat-contract-preview" -Envelope $PostResponse
  } catch {
    $LiveRows += [pscustomobject]@{
      Check = "POST /api/hx2/retail-chat-contract-preview"
      Status = "RED"
      Detail = $_.Exception.Message
    }
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CONTRACT RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves a stable retail-safe chat response contract surface, not full UI wiring."
  Next = "Wire chat-master output through this contract after preview surface is proven."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat contract smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  throw "Retail chat contract strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat contract smoke complete" -ForegroundColor Green
