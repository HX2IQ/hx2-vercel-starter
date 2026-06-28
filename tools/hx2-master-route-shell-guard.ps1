$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 MASTER ROUTE SHELL GUARD =="

$RouteFile = ".\app\api\hx2\chat-master\route.ts"

$RequiredModules = @(
  @{
    Path = ".\app\api\hx2\_lib\master-benchmark-quality-lift.ts"
    Markers = @("export function benchmarkQualityLiftAnswer")
  },
  @{
    Path = ".\app\api\hx2\_lib\master-direct-intelligence.ts"
    Markers = @("export function masterChatDirectIntelligenceAnswer")
  },
  @{
    Path = ".\app\api\hx2\_lib\master-retrieval-synthesis.ts"
    Markers = @("export function getNodeRetrievalAnswer", "export function synthesizeRetrievedAnswer", "export function getRetrievedSummary")
  },
  @{
    Path = ".\app\api\hx2\_lib\master-youtube-chat-bridge.ts"
    Markers = @("export async function synthesizeYouTubeChatAnswer")
  },
  @{
    Path = ".\app\api\hx2\_lib\master-x2-markets-execution.ts"
    Markers = @("export async function executeX2")
  },
  @{
    Path = ".\app\api\hx2\_lib\master-node-executors.ts"
    Markers = @("export async function executeNode")
  }
)

if (-not (Test-Path $RouteFile)) {
  throw "Missing route file: $RouteFile"
}

$Route = Get-Content $RouteFile -Raw
$Rows = @()

function Add-GuardRow {
  param(
    [string]$Check,
    [string]$Status,
    [string]$Detail
  )

  $script:Rows += [pscustomobject]@{
    Check = $Check
    Status = $Status
    Detail = $Detail
  }
}

$RouteImports = @(
  'from "../_lib/master-benchmark-quality-lift"',
  'from "../_lib/master-direct-intelligence"',
  'from "../_lib/master-youtube-chat-bridge"',
  'from "../_lib/master-node-executors"'
)

foreach ($Import in $RouteImports) {
  if ($Route.Contains($Import)) {
    Add-GuardRow -Check "route import $Import" -Status "GREEN" -Detail "present"
  } else {
    Add-GuardRow -Check "route import $Import" -Status "RED" -Detail "missing"
  }
}

$ForbiddenRoutePatterns = @(
  "function benchmarkQualityLiftAnswer",
  "function masterChatDirectIntelligenceAnswer",
  "function getNodeRetrievalAnswer",
  "function cleanRetrievedText",
  "function synthesizeRetrievedAnswer",
  "function getRetrievedSummary",
  "function wantsYouTubeChatAnswer",
  "function summarizeTranscriptSignal",
  "function synthesizeYouTubeRouterResult",
  "async function synthesizeYouTubeChatAnswer",
  "function detectCryptoSymbol",
  "async function getCryptoSpot",
  "async function executeX2",
  "async function executePA2",
  "async function executeAH2",
  "async function executeDEV2",
  "async function executeL2",
  "async function executeHX2",
  "const NODE_EXECUTORS",
  "async function executeNode",
  "async function safePostJson"
)

foreach ($Pattern in $ForbiddenRoutePatterns) {
  if ($Route.Contains($Pattern)) {
    Add-GuardRow -Check "route excludes $Pattern" -Status "RED" -Detail "found in route"
  } else {
    Add-GuardRow -Check "route excludes $Pattern" -Status "GREEN" -Detail "not present"
  }
}

if ($Route.Contains("export async function POST")) {
  Add-GuardRow -Check "route POST handler" -Status "GREEN" -Detail "present"
} else {
  Add-GuardRow -Check "route POST handler" -Status "RED" -Detail "missing"
}

foreach ($Module in $RequiredModules) {
  if (-not (Test-Path $Module.Path)) {
    Add-GuardRow -Check $Module.Path -Status "RED" -Detail "missing"
    continue
  }

  $Content = Get-Content $Module.Path -Raw

  foreach ($Marker in $Module.Markers) {
    if ($Content.Contains($Marker)) {
      Add-GuardRow -Check "$($Module.Path) marker" -Status "GREEN" -Detail $Marker
    } else {
      Add-GuardRow -Check "$($Module.Path) marker" -Status "RED" -Detail "missing: $Marker"
    }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "MASTER ROUTE SHELL SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Meaning = "This guard fails if extracted master-chat logic moves back into chat-master/route.ts or required modules/exports disappear."
} | Format-List

if ($Red -gt 0) {
  throw "Master route shell guard failed."
}

Write-Host "GREEN: master route shell guard passed."

