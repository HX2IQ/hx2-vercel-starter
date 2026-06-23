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
Write-Host "== HX2 ANSWER QUALITY + PARTICIPATION SMOKE ==" -ForegroundColor Cyan
Write-Host ("Base:       {0}" -f $Base)
Write-Host ("Local only: {0}" -f [bool]$LocalOnly)
Write-Host ("Strict:     {0}" -f [bool]$Strict)

function Convert-Hx2ObjectToText {
  param($Value)

  try {
    return ($Value | ConvertTo-Json -Depth 40)
  } catch {
    return [string]$Value
  }
}

function Get-Hx2FileText {
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
    Detail = "no concrete internal leak markers"
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

function Test-Hx2SignalSet {
  param(
    [string]$Text,
    [string[]]$Terms
  )

  $Hits = @()

  foreach ($Term in $Terms) {
    if ($Text -match [regex]::Escape($Term)) {
      $Hits += $Term
    }
  }

  return $Hits | Select-Object -Unique
}

function Invoke-Hx2AnswerEndpoint {
  param(
    [string]$Path,
    [hashtable]$Payload
  )

  if ($LocalOnly) {
    return [pscustomobject]@{
      Endpoint = $Path
      Status = "SKIPPED"
      AnswerQuality = "SKIPPED"
      Participation = "SKIPPED"
      LeakStatus = "SKIPPED"
      Detail = "local-only mode"
    }
  }

  $Url = "$Base$Path"
  $Body = $Payload | ConvertTo-Json -Depth 30

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 60
    $Text = Convert-Hx2ObjectToText -Value $Response

    $Leak = Test-Hx2NoInternalLeak -Text $Text

    if ($Leak.Status -eq "RED") {
      return [pscustomobject]@{
        Endpoint = $Path
        Status = "RED"
        AnswerQuality = "UNKNOWN"
        Participation = "UNKNOWN"
        LeakStatus = "RED"
        Detail = $Leak.Detail
      }
    }

    $Readable = -not [string]::IsNullOrWhiteSpace($Text)
    $LengthOk = ($Text.Length -ge 25)
    $ShapeOk = ($Text -match "answer|response|message|content|summary|text|status|result|mode|route|ok")
    $LooksBroken = ($Text -match "Internal Server Error|Unhandled Runtime Error|SyntaxError|ReferenceError|TypeError|stack trace|ECONNREFUSED")

    $QualityStatus = "GREEN"
    $QualityDetail = "readable answer shape"

    if (-not $Readable) {
      $QualityStatus = "YELLOW"
      $QualityDetail = "empty response"
    } elseif ($LooksBroken) {
      $QualityStatus = "RED"
      $QualityDetail = "response looks like server/runtime error"
    } elseif (-not $LengthOk -or -not $ShapeOk) {
      $QualityStatus = "YELLOW"
      $QualityDetail = "response readable but weak/unclear shape"
    }

    $RetrievalTerms = @("retrieval", "source", "sources", "evidence", "search", "document", "citation", "retrieved")
    $OrchestratorTerms = @("route", "router", "planner", "orchestrator", "capability", "mode", "intent")
    $KgxTerms = @("kgx", "memory", "graph", "context", "node", "lineage")

    $RetrievalHits = @(Test-Hx2SignalSet -Text $Text -Terms $RetrievalTerms)
    $OrchestratorHits = @(Test-Hx2SignalSet -Text $Text -Terms $OrchestratorTerms)
    $KgxHits = @(Test-Hx2SignalSet -Text $Text -Terms $KgxTerms)

    $ParticipationHits = @($RetrievalHits + $OrchestratorHits + $KgxHits) | Select-Object -Unique

    $ParticipationStatus = "GREEN"
    $ParticipationDetail = "signals: $($ParticipationHits -join ', ')"

    if ($ParticipationHits.Count -eq 0) {
      $ParticipationStatus = "YELLOW"
      $ParticipationDetail = "no safe participation markers detected in response"
    } elseif ($RetrievalHits.Count -eq 0) {
      $ParticipationStatus = "YELLOW"
      $ParticipationDetail = "orchestration signals found, retrieval markers not visible"
    }

    $Overall = "GREEN"

    if ($QualityStatus -eq "RED" -or $Leak.Status -eq "RED") {
      $Overall = "RED"
    } elseif ($QualityStatus -eq "YELLOW" -or $ParticipationStatus -eq "YELLOW") {
      $Overall = "YELLOW"
    }

    return [pscustomobject]@{
      Endpoint = $Path
      Status = $Overall
      AnswerQuality = $QualityStatus
      Participation = $ParticipationStatus
      LeakStatus = $Leak.Status
      Detail = if ($Overall -eq "GREEN") { "answer quality and participation markers acceptable" } else { "$QualityDetail; $ParticipationDetail" }
    }
  } catch {
    return [pscustomobject]@{
      Endpoint = $Path
      Status = "YELLOW"
      AnswerQuality = "UNKNOWN"
      Participation = "UNKNOWN"
      LeakStatus = "UNKNOWN"
      Detail = $_.Exception.Message
    }
  }
}

Write-Host ""
Write-Host "LOCAL ANSWER PATH CONTRACTS" -ForegroundColor Cyan

$LocalRows = @()
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\chat-master\route.ts" -Markers @("POST")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\chat\route.ts" -Markers @("POST")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\chat-master-router.ts" -Markers @("chat")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\capability-planner.ts" -Markers @("capability")
$LocalRows += Test-Hx2LocalContract -Path ".\app\api\hx2\_lib\master-synth.ts" -Markers @("synth")

$LocalRows | Format-Table -AutoSize

$RequestId = "hx2-answer-quality-" + (Get-Date -Format "yyyyMMdd-HHmmss")

$SafeQuestion = "Give one concise public status answer for HX2 right now. Mention whether the safe preview chat path is responding."

$Payload = @{
  message = $SafeQuestion
  prompt = $SafeQuestion
  q = $SafeQuestion
  input = $SafeQuestion
  messages = @(
    @{
      role = "user"
      content = $SafeQuestion
    }
  )
  mode = "safe_preview"
  preview = $true
  safePreview = $true
  dryRun = $true
  noPersist = $true
  readOnly = $true
  source = "hx2-answer-quality-smoke"
  requestId = $RequestId
  ipFirewall = "safe_metadata_only_no_brain_logic"
}

Write-Host ""
Write-Host "LIVE ANSWER QUALITY CANDIDATES" -ForegroundColor Cyan

$AnswerRows = @()
$AnswerRows += Invoke-Hx2AnswerEndpoint -Path "/api/hx2/chat-master" -Payload $Payload
$AnswerRows += Invoke-Hx2AnswerEndpoint -Path "/api/hx2/chat" -Payload $Payload

$AnswerRows | Format-Table -AutoSize

Write-Host ""
Write-Host "SUPPORTING SAFE STATUS SURFACES" -ForegroundColor Cyan

$SurfaceRows = @()

foreach ($Path in @(
  "/api/hx2/chat-master-status",
  "/api/hx2/chat-master-readiness",
  "/api/hx2/chat-master-diagnostics",
  "/api/hx2/chat-master-route-test",
  "/api/hx2/retrieval-status",
  "/api/hx2/orchestrator-status",
  "/api/hx2/owner-status",
  "/api/hx2/deployment-status"
)) {
  if ($LocalOnly) {
    $SurfaceRows += [pscustomobject]@{
      Endpoint = $Path
      Status = "SKIPPED"
      Detail = "local-only mode"
    }
  } else {
    try {
      $Url = "$Base$Path"
      $Response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30
      $Text = Convert-Hx2ObjectToText -Value $Response
      $Leak = Test-Hx2NoInternalLeak -Text $Text

      $SurfaceRows += [pscustomobject]@{
        Endpoint = $Path
        Status = $Leak.Status
        Detail = if ($Leak.Status -eq "GREEN") { "safe status surface responded" } else { $Leak.Detail }
      }
    } catch {
      $SurfaceRows += [pscustomobject]@{
        Endpoint = $Path
        Status = "YELLOW"
        Detail = $_.Exception.Message
      }
    }
  }
}

$SurfaceRows | Format-Table -AutoSize

Write-Host ""
Write-Host "ANSWER QUALITY RESULT" -ForegroundColor Cyan

$AllRows = @($LocalRows + $AnswerRows + $SurfaceRows)
$Green = @($AllRows | Where-Object Status -eq "GREEN").Count
$Yellow = @($AllRows | Where-Object Status -eq "YELLOW").Count
$Red = @($AllRows | Where-Object Status -eq "RED").Count
$Skipped = @($AllRows | Where-Object Status -eq "SKIPPED").Count
$LiveGreen = @($AnswerRows | Where-Object Status -eq "GREEN").Count
$LiveAcceptable = @($AnswerRows | Where-Object { $_.Status -eq "GREEN" -or $_.Status -eq "YELLOW" }).Count
$Total = @($AllRows).Count

[pscustomobject]@{
  Green = "$Green / $Total"
  Yellow = "$Yellow / $Total"
  Red = "$Red / $Total"
  Skipped = "$Skipped / $Total"
  LiveAnswerGreen = $LiveGreen
  LiveAnswerAcceptable = $LiveAcceptable
  Meaning = "This checks answer shape and safe participation markers, not final retail answer quality."
  Next = "If yellow participation remains, add explicit safe metadata fields to chat-master response."
} | Format-List

if ($Red -gt 0) {
  throw "Answer quality smoke found red checks."
}

if (-not $LocalOnly -and $LiveAcceptable -lt 1) {
  throw "No live HX2 answer endpoint returned an acceptable safe-preview response."
}

if ($Strict -and $Yellow -gt 0) {
  throw "Answer quality strict smoke found yellow checks."
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
Write-Host "GREEN: answer quality and participation smoke complete" -ForegroundColor Green
