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
Write-Host "== HX2 LIVE CHAT E2E SAFE PREVIEW SMOKE ==" -ForegroundColor Cyan
Write-Host ("Base:       {0}" -f $Base)
Write-Host ("Local only: {0}" -f [bool]$LocalOnly)
Write-Host ("Strict:     {0}" -f [bool]$Strict)

function Get-Hx2FileText {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }

  return (Get-Content -LiteralPath $Path) -join "`n"
}

function Convert-Hx2ObjectToText {
  param($Value)

  try {
    return ($Value | ConvertTo-Json -Depth 30)
  } catch {
    return [string]$Value
  }
}

function Test-Hx2NoBrainLeak {
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
      Detail = "possible leakage markers: $($Hits -join ', ')"
    }
  }

  return [pscustomobject]@{
    Status = "GREEN"
    Detail = "no forbidden internal-leak markers detected"
  }
}

function Test-Hx2LocalContract {
  param(
    [string]$Path,
    [string[]]$Markers
  )

  $Text = Get-Hx2FileText -Path $Path

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return [pscustomobject]@{
      Check = $Path
      Status = "YELLOW"
      Detail = "file missing or empty"
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

function Invoke-Hx2ChatEndpoint {
  param(
    [string]$Path,
    [hashtable]$Payload
  )

  if ($LocalOnly) {
    return [pscustomobject]@{
      Endpoint = $Path
      Status = "SKIPPED"
      Http = "local-only"
      Detail = "local-only mode"
      LeakStatus = "SKIPPED"
    }
  }

  $Url = "$Base$Path"
  $Body = $Payload | ConvertTo-Json -Depth 20

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 45
    $Text = Convert-Hx2ObjectToText -Value $Response
    $Leak = Test-Hx2NoBrainLeak -Text $Text

    $Readable = -not [string]::IsNullOrWhiteSpace($Text)
    $HasUsefulShape = ($Text -match "answer|response|message|content|mode|route|ok|status|result|summary")

    $Status = "GREEN"
    $Detail = "live POST responded"

    if (-not $Readable) {
      $Status = "YELLOW"
      $Detail = "response was empty"
    } elseif (-not $HasUsefulShape) {
      $Status = "YELLOW"
      $Detail = "response readable but shape is unclear"
    }

    if ($Leak.Status -eq "RED") {
      $Status = "RED"
      $Detail = $Leak.Detail
    }

    return [pscustomobject]@{
      Endpoint = $Path
      Status = $Status
      Http = "POST"
      Detail = $Detail
      LeakStatus = $Leak.Status
    }
  } catch {
    return [pscustomobject]@{
      Endpoint = $Path
      Status = "YELLOW"
      Http = "POST"
      Detail = $_.Exception.Message
      LeakStatus = "UNKNOWN"
    }
  }
}

$RequestId = "hx2-chat-e2e-" + (Get-Date -Format "yyyyMMdd-HHmmss")

$SafePrompt = "HX2 safe preview smoke test. Reply with one short public status sentence only."

$Payload = @{
  message = $SafePrompt
  prompt = $SafePrompt
  q = $SafePrompt
  input = $SafePrompt
  messages = @(
    @{
      role = "user"
      content = $SafePrompt
    }
  )
  mode = "safe_preview"
  preview = $true
  safePreview = $true
  dryRun = $true
  noPersist = $true
  readOnly = $true
  source = "hx2-live-chat-e2e-smoke"
  requestId = $RequestId
  ipFirewall = "safe_metadata_only_no_brain_logic"
}

Write-Host ""
Write-Host "LOCAL CHAT CONTRACTS" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\chat-master\route.ts" -Markers @("POST")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\chat\route.ts" -Markers @("POST")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\chat-master-router.ts" -Markers @("chat")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\capability-planner.ts" -Markers @("capability")

$LocalRows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE CHAT POST CANDIDATES" -ForegroundColor Cyan

$ChatRows = @()
$ChatRows += Invoke-Hx2ChatEndpoint -Path "/api/hx2/chat-master" -Payload $Payload
$ChatRows += Invoke-Hx2ChatEndpoint -Path "/api/hx2/chat" -Payload $Payload

$ChatRows | Format-Table -AutoSize

Write-Host ""
Write-Host "SUPPORTING READINESS SURFACES" -ForegroundColor Cyan

$ReadinessRows = @()

foreach ($Path in @(
  "/api/hx2/chat-master-status",
  "/api/hx2/chat-master-readiness",
  "/api/hx2/chat-master-diagnostics",
  "/api/hx2/chat-master-route-test",
  "/api/hx2/retrieval-status",
  "/api/hx2/owner-status",
  "/api/hx2/deployment-status"
)) {
  if ($LocalOnly) {
    $ReadinessRows += [pscustomobject]@{
      Endpoint = $Path
      Status = "SKIPPED"
      Detail = "local-only mode"
    }
  } else {
    try {
      $Url = "$Base$Path"
      $Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30
      $Text = Convert-Hx2ObjectToText -Value $Response
      $Leak = Test-Hx2NoBrainLeak -Text $Text

      $ReadinessRows += [pscustomobject]@{
        Endpoint = $Path
        Status = $Leak.Status
        Detail = if ($Leak.Status -eq "GREEN") { "live GET responded safely" } else { $Leak.Detail }
      }
    } catch {
      $ReadinessRows += [pscustomobject]@{
        Endpoint = $Path
        Status = "YELLOW"
        Detail = $_.Exception.Message
      }
    }
  }
}

$ReadinessRows | Format-Table -AutoSize

Write-Host ""
Write-Host "CHAT E2E RESULT" -ForegroundColor Cyan

$AllRows = @($LocalRows + $ChatRows + $ReadinessRows)
$Green = @($AllRows | Where-Object Status -eq "GREEN").Count
$Yellow = @($AllRows | Where-Object Status -eq "YELLOW").Count
$Red = @($AllRows | Where-Object Status -eq "RED").Count
$Skipped = @($AllRows | Where-Object Status -eq "SKIPPED").Count
$LiveChatGreen = @($ChatRows | Where-Object Status -eq "GREEN").Count
$Total = @($AllRows).Count

[pscustomobject]@{
  Green = "$Green / $Total"
  Yellow = "$Yellow / $Total"
  Red = "$Red / $Total"
  Skipped = "$Skipped / $Total"
  LiveChatGreen = $LiveChatGreen
  Meaning = "This proves safe preview chat-path behavior, not paid production chat quality."
  Next = "If live chat is green, add answer-quality and retrieval-participation smoke."
} | Format-List

if ($Red -gt 0) {
  throw "Live chat E2E smoke found red checks."
}

if (-not $LocalOnly -and $LiveChatGreen -lt 1) {
  throw "No live HX2 chat endpoint returned a green safe-preview response."
}

if ($Strict -and $Yellow -gt 0) {
  throw "Live chat E2E strict smoke found yellow checks."
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
Write-Host "GREEN: live chat E2E safe preview smoke complete" -ForegroundColor Green
