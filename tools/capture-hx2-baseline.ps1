param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

$Auth="Bearer $env:HX2_API_KEY"
$Headers=@{
  Authorization = $Auth
  "Content-Type" = "application/json"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$baselineRoot = ".\tools\baselines"
$stagingRoot = Join-Path $baselineRoot "_staging"
$stageDir = Join-Path $stagingRoot $stamp
$finalDir = Join-Path $baselineRoot $stamp

New-Item -ItemType Directory -Force -Path $baselineRoot | Out-Null
New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null
New-Item -ItemType Directory -Force -Path $stageDir | Out-Null

function Invoke-WithRetry {
  param(
    [scriptblock]$Action,
    [string]$Label,
    [int]$MaxAttempts = 4,
    [int]$DelaySeconds = 8
  )

  $lastError = $null

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      return & $Action
    }
    catch {
      $lastError = $_
      if ($attempt -lt $MaxAttempts) {
        Write-Host "$Label failed on attempt $attempt/$MaxAttempts. Retrying in $DelaySeconds sec..." -ForegroundColor Yellow
        Start-Sleep -Seconds $DelaySeconds
      }
    }
  }

  throw $lastError
}

function Invoke-JsonPost {
  param(
    [string]$Url,
    [hashtable]$Body
  )

  $json = $Body | ConvertTo-Json -Depth 10

  $resp = Invoke-WithRetry -Label "POST $Url" -Action {
    Invoke-WebRequest $Url -Method Post -Headers $Headers -Body $json -TimeoutSec 90
  }

  $obj = $resp.Content | ConvertFrom-Json
  return [pscustomobject]@{
    StatusCode = $resp.StatusCode
    Json = $obj
    Raw = $resp.Content
  }
}

function Save-Json {
  param(
    [string]$Path,
    $Object
  )
  $Object | ConvertTo-Json -Depth 20 | Set-Content $Path -Encoding UTF8
}

function Save-Text {
  param(
    [string]$Path,
    [string]$Text
  )
  $Text | Set-Content $Path -Encoding UTF8
}

function Test-BaselineComplete {
  param([string]$Dir)

  $required = @(
    "brain-status.json",
    "x2-baseline.json",
    "x2-baseline.reply.txt",
    "h2-baseline.json",
    "h2-baseline.reply.txt",
    "x2-mixed.json",
    "x2-mixed.reply.txt",
    "h2-cross.json",
    "h2-cross.reply.txt",
    "manifest.json"
  )

  foreach ($name in $required) {
    if (-not (Test-Path (Join-Path $Dir $name))) {
      return $false
    }
  }

  return $true
}

try {
  $brain = Invoke-WithRetry -Label "GET $Base/api/brain/status" -Action {
    Invoke-WebRequest "$Base/api/brain/status" -TimeoutSec 30
  }
  $brainJson = $brain.Content | ConvertFrom-Json
  Save-Json (Join-Path $stageDir "brain-status.json") $brainJson

  $x2Body = @{
    message     = "What does the latest macro intelligence imply for XRP and broader markets?"
    node_target = "X2"
  }

  $x2 = Invoke-JsonPost -Url "$Base/api/chat/send" -Body $x2Body
  Save-Json (Join-Path $stageDir "x2-baseline.json") $x2.Json
  Save-Text (Join-Path $stageDir "x2-baseline.reply.txt") ([string]$x2.Json.result.data.reply)

  $h2Body = @{
    message     = "What are the biggest geopolitical signals in the latest intelligence?"
    node_target = "H2"
  }

  $h2 = Invoke-JsonPost -Url "$Base/api/chat/send" -Body $h2Body
  Save-Json (Join-Path $stageDir "h2-baseline.json") $h2.Json
  Save-Text (Join-Path $stageDir "h2-baseline.reply.txt") ([string]$h2.Json.result.data.reply)

  $x2MixedBody = @{
    message     = "Does the latest intelligence suggest a real risk-off move for XRP because of Iran and Taiwan tensions, or is this still mostly background noise?"
    node_target = "X2"
  }

  $x2Mixed = Invoke-JsonPost -Url "$Base/api/chat/send" -Body $x2MixedBody
  Save-Json (Join-Path $stageDir "x2-mixed.json") $x2Mixed.Json
  Save-Text (Join-Path $stageDir "x2-mixed.reply.txt") ([string]$x2Mixed.Json.result.data.reply)

  $h2CrossBody = @{
    message     = "Do the latest intelligence signals suggest these Iran and Taiwan developments are connected as part of a broader escalation pattern, or should they still be treated as separate theaters?"
    node_target = "H2"
  }

  $h2Cross = Invoke-JsonPost -Url "$Base/api/chat/send" -Body $h2CrossBody
  Save-Json (Join-Path $stageDir "h2-cross.json") $h2Cross.Json
  Save-Text (Join-Path $stageDir "h2-cross.reply.txt") ([string]$h2Cross.Json.result.data.reply)

  $manifest = [pscustomobject]@{
    generated_at = (Get-Date).ToString("s")
    base = $Base
    stage_dir = (Resolve-Path $stageDir).Path
    files = Get-ChildItem $stageDir | Select-Object Name,Length,LastWriteTime
  }
  Save-Json (Join-Path $stageDir "manifest.json") $manifest

  if (-not (Test-BaselineComplete $stageDir)) {
    throw "Staged baseline is incomplete"
  }

  if (Test-Path $finalDir) {
    throw "Final baseline folder already exists: $finalDir"
  }

  Move-Item $stageDir $finalDir

  Write-Host "Baseline captured at: $((Resolve-Path $finalDir).Path)" -ForegroundColor Green
  Get-ChildItem $finalDir | Select-Object Name,Length,LastWriteTime
}
catch {
  Write-Host "Baseline capture failed; staged artifacts left at: $stageDir" -ForegroundColor Yellow
  throw
}
