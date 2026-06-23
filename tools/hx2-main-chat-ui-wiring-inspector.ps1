param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host ""
Write-Host "== HX2 MAIN CHAT UI WIRING INSPECTOR ==" -ForegroundColor Cyan
Write-Host ("Strict: {0}" -f [bool]$Strict)

function Get-Hx2Text {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  return (Get-Content -LiteralPath $Path) -join "`n"
}

function Test-Hx2ExcludedPath {
  param([string]$Path)

  $Normalized = $Path.Replace("/", "\")

  $Excluded = @(
    "\.git\",
    "\.next\",
    "\node_modules\",
    "\.vercel\",
    "\coverage\",
    "\dist\",
    "\build\",
    "\tools\",
    "\app\api\",
    "\app\hx2-retail-chat-proof\"
  )

  foreach ($Item in $Excluded) {
    if ($Normalized -like "*$Item*") { return $true }
  }

  return $false
}

function Test-Hx2FileReady {
  param(
    [string]$Label,
    [string]$Path,
    [string[]]$Markers
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return [pscustomobject]@{
      Check = $Label
      Status = "RED"
      Path = $Path
      Detail = "missing"
    }
  }

  $Text = Get-Hx2Text -Path $Path
  $Missing = @()

  foreach ($Marker in $Markers) {
    if ($Text -notmatch [regex]::Escape($Marker)) {
      $Missing += $Marker
    }
  }

  if ($Missing.Count -gt 0) {
    return [pscustomobject]@{
      Check = $Label
      Status = "YELLOW"
      Path = $Path
      Detail = "missing marker(s): $($Missing -join ', ')"
    }
  }

  return [pscustomobject]@{
    Check = $Label
    Status = "GREEN"
    Path = $Path
    Detail = "ready"
  }
}

function Get-Hx2SourceFiles {
  $Roots = @(".\app", ".\components", ".\src", ".\lib")
  $Files = @()

  foreach ($Dir in $Roots) {
    if (Test-Path -LiteralPath $Dir) {
      $Files += Get-ChildItem -LiteralPath $Dir -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
          $_.Extension -in @(".ts", ".tsx", ".js", ".jsx") -and
          -not (Test-Hx2ExcludedPath -Path $_.FullName)
        }
    }
  }

  return $Files | Sort-Object FullName -Unique
}

function Get-Hx2CandidateScore {
  param(
    [string]$Path,
    [string]$Text
  )

  $Score = 0
  $Signals = @()
  $Lower = $Text.ToLowerInvariant()
  $Name = [System.IO.Path]::GetFileName($Path).ToLowerInvariant()

  if ($Lower -match "use client") { $Score += 8; $Signals += "client_component" }
  if ($Lower -match "sendhx2mainchatuimessage") { $Score += 50; $Signals += "already_uses_main_adapter" }
  if ($Lower -match "sendhx2retailchatmessage") { $Score += 35; $Signals += "uses_retail_client_helper" }
  if ($Lower -match "/api/hx2/chat-master") { $Score += 28; $Signals += "direct_chat_master_endpoint" }
  if ($Lower -match "/api/hx2/chat") { $Score += 24; $Signals += "direct_chat_endpoint" }
  if ($Lower -match "fetch\(") { $Score += 14; $Signals += "fetch_call" }
  if ($Lower -match "onsubmit|handlesubmit|sendmessage|handlesend") { $Score += 20; $Signals += "send_handler" }
  if ($Lower -match "textarea|input") { $Score += 10; $Signals += "input_control" }
  if ($Lower -match "chat" -or $Name -match "chat") { $Score += 16; $Signals += "chat_named_surface" }
  if ($Lower -match "message|messages") { $Score += 8; $Signals += "message_state" }
  if ($Lower -match "stream|eventsource|readablestream") { $Score += 12; $Signals += "streaming_surface" }
  if ($Path -match "\\lib\\") { $Score -= 8; $Signals += "library_lower_priority" }

  return [pscustomobject]@{
    Path = $Path.Replace($Root + "\", "")
    Score = $Score
    Signals = ($Signals -join ", ")
  }
}

Write-Host ""
Write-Host "ADAPTER READINESS" -ForegroundColor Cyan

$ReadinessRows = @()
$ReadinessRows += Test-Hx2FileReady -Label "main chat UI adapter" -Path ".\lib\hx2-main-chat-ui-adapter.ts" -Markers @("sendHx2MainChatUiMessage", "retail_chat_contract_v1", "no_raw_chat_master_display")
$ReadinessRows += Test-Hx2FileReady -Label "retail chat client helper" -Path ".\lib\hx2-retail-chat-client.ts" -Markers @("sendHx2RetailChatMessage", "getHx2RetailChatConsumerPreference", "retail_chat_contract_v1")
$ReadinessRows += Test-Hx2FileReady -Label "retail UI proof page" -Path ".\app\hx2-retail-chat-proof\page.tsx" -Markers @("HX2 Retail Chat UI Proof", "retail_chat_contract_v1")

$ReadinessRows | Format-Table -AutoSize

Write-Host ""
Write-Host "DISCOVERING CHAT UI CANDIDATES" -ForegroundColor Cyan

$Files = Get-Hx2SourceFiles
$CandidateRows = @()

foreach ($File in $Files) {
  $Text = Get-Hx2Text -Path $File.FullName
  if ([string]::IsNullOrWhiteSpace($Text)) { continue }

  $LooksRelevant =
    $Text -match "chat" -or
    $Text -match "message" -or
    $Text -match "/api/hx2/chat" -or
    $Text -match "sendMessage" -or
    $Text -match "handleSubmit" -or
    $Text -match "textarea"

  if ($LooksRelevant) {
    $Candidate = Get-Hx2CandidateScore -Path $File.FullName -Text $Text
    if ($Candidate.Score -gt 0) { $CandidateRows += $Candidate }
  }
}

$RankedCandidates = $CandidateRows | Sort-Object Score -Descending | Select-Object -First 20

if ($RankedCandidates.Count -gt 0) {
  $RankedCandidates | Format-Table -AutoSize
} else {
  Write-Host "YELLOW: no obvious main chat UI candidates found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "DIRECT CHAT ENDPOINT USAGE MAP" -ForegroundColor Cyan

$DirectRows = @()

foreach ($File in $Files) {
  $Text = Get-Hx2Text -Path $File.FullName

  if ($Text -match "/api/hx2/chat" -or $Text -match "/api/hx2/chat-master") {
    $DirectRows += [pscustomobject]@{
      Path = $File.FullName.Replace($Root + "\", "")
      UsesChat = [bool]($Text -match "/api/hx2/chat")
      UsesChatMaster = [bool]($Text -match "/api/hx2/chat-master")
      UsesMainAdapter = [bool]($Text -match "sendHx2MainChatUiMessage")
      UsesRetailHelper = [bool]($Text -match "sendHx2RetailChatMessage")
    }
  }
}

if ($DirectRows.Count -gt 0) {
  $DirectRows | Format-Table -AutoSize
} else {
  Write-Host "GREEN: no direct non-api UI endpoint usage found in scanned UI files." -ForegroundColor Green
}

Write-Host ""
Write-Host "RECOMMENDED NEXT PATCH TARGET" -ForegroundColor Cyan

$Top = $RankedCandidates | Select-Object -First 1

if ($Top) {
  [pscustomobject]@{
    RecommendedTarget = $Top.Path
    Score = $Top.Score
    Signals = $Top.Signals
    SafePatch = "Import sendHx2MainChatUiMessage from lib/hx2-main-chat-ui-adapter and route one send/submit path through it."
    Guardrail = "Patch one call path only; keep rollback point at current commit."
  } | Format-List
} else {
  [pscustomobject]@{
    RecommendedTarget = "NONE"
    Score = 0
    Signals = "No candidate found"
    SafePatch = "Do not patch UI yet. Manually inspect app/components layout."
    Guardrail = "Stop before modifying UI."
  } | Format-List
}

Write-Host ""
Write-Host "MAIN CHAT UI WIRING INSPECTION RESULT" -ForegroundColor Cyan

$ReadinessGreen = @($ReadinessRows | Where-Object Status -eq "GREEN").Count
$ReadinessYellow = @($ReadinessRows | Where-Object Status -eq "YELLOW").Count
$ReadinessRed = @($ReadinessRows | Where-Object Status -eq "RED").Count
$CandidateCount = @($RankedCandidates).Count
$DirectCount = @($DirectRows).Count

$OverallStatus = "GREEN"
$Meaning = "Adapter layer is ready and candidate scan completed."

if ($ReadinessRed -gt 0) {
  $OverallStatus = "RED"
  $Meaning = "Adapter readiness failed. Do not patch main UI."
} elseif ($CandidateCount -eq 0) {
  $OverallStatus = "YELLOW"
  $Meaning = "Adapter ready, but no clear main chat UI candidate was found."
} elseif ($ReadinessYellow -gt 0) {
  $OverallStatus = "YELLOW"
  $Meaning = "Adapter mostly ready, but some readiness markers are missing."
}

[pscustomobject]@{
  Status = $OverallStatus
  AdapterReadinessGreen = "$ReadinessGreen / $($ReadinessRows.Count)"
  AdapterReadinessYellow = $ReadinessYellow
  AdapterReadinessRed = $ReadinessRed
  RankedCandidates = $CandidateCount
  DirectEndpointFiles = $DirectCount
  Meaning = $Meaning
  Next = "Use the top-ranked target for the next low-risk main chat UI wiring patch."
} | Format-List

if ($ReadinessRed -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $ReadinessRows | Where-Object Status -eq "RED" | Format-List
  throw "Main chat UI wiring inspector found red readiness checks."
}

if ($Strict -and ($ReadinessYellow -gt 0 -or $CandidateCount -eq 0)) {
  throw "Strict main chat UI wiring inspector found yellow checks."
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
Write-Host "GREEN: main chat UI wiring inspection complete" -ForegroundColor Green
