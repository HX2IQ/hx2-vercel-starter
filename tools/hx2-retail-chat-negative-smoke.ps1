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
$Endpoint = "$Base/api/hx2/main-chat-ui-adapter-proof"

Write-Host ""
Write-Host "== HX2 RETAIL CHAT NEGATIVE / ERROR-STATE SMOKE ==" -ForegroundColor Cyan
Write-Host ("Base:       {0}" -f $Base)
Write-Host ("Endpoint:   {0}" -f $Endpoint)
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

function New-Hx2ProbeRow {
  param(
    [string]$Case,
    [int]$StatusCode,
    [string]$Expected,
    [string]$Status,
    [string]$Detail
  )

  return [pscustomobject]@{
    Case = $Case
    StatusCode = $StatusCode
    Expected = $Expected
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

function Invoke-Hx2PostRaw {
  param(
    [string]$Url,
    [string]$Body,
    [string]$ContentType = "application/json"
  )

  Add-Type -AssemblyName System.Net.Http | Out-Null

  $Client = [System.Net.Http.HttpClient]::new()
  $Client.Timeout = [TimeSpan]::FromSeconds(70)

  try {
    $Content = [System.Net.Http.StringContent]::new($Body, [System.Text.Encoding]::UTF8, $ContentType)
    $Response = $Client.PostAsync($Url, $Content).GetAwaiter().GetResult()
    $ResponseBody = $Response.Content.ReadAsStringAsync().GetAwaiter().GetResult()

    return [pscustomobject]@{
      StatusCode = [int]$Response.StatusCode
      Body = [string]$ResponseBody
      Error = ""
    }
  } catch {
    return [pscustomobject]@{
      StatusCode = 0
      Body = ""
      Error = $_.Exception.Message
    }
  } finally {
    if ($Client) {
      $Client.Dispose()
    }
  }
}

function Test-Hx2Probe {
  param(
    [string]$Case,
    [string]$Body,
    [string]$Expected,
    [string]$ContentType = "application/json"
  )

  $Result = Invoke-Hx2PostRaw -Url $Endpoint -Body $Body -ContentType $ContentType
  $StatusCode = [int]$Result.StatusCode
  $ResponseBody = [string]$Result.Body
  $Leak = Test-Hx2NoInternalLeak -Text $ResponseBody

  if (-not [string]::IsNullOrWhiteSpace($Leak)) {
    return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "RED" -Detail $Leak
  }

  if ($StatusCode -eq 0) {
    return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "RED" -Detail "request failed: $($Result.Error)"
  }

  if ($Expected -eq "no_5xx_safe_error_or_answer") {
    if ($StatusCode -ge 500) {
      return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "RED" -Detail "server crash / 5xx response"
    }

    return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "GREEN" -Detail "no 5xx and no leak"
  }

  if ($Expected -eq "normal_recovery_2xx_answer") {
    if ($StatusCode -lt 200 -or $StatusCode -ge 300) {
      return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "RED" -Detail "normal recovery prompt did not return 2xx"
    }

    if ($ResponseBody -notmatch "answer") {
      return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "RED" -Detail "normal recovery response missing answer marker"
    }

    return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "GREEN" -Detail "normal recovery returned answer"
  }

  return New-Hx2ProbeRow -Case $Case -StatusCode $StatusCode -Expected $Expected -Status "RED" -Detail "unknown expectation"
}

Write-Host ""
Write-Host "LOCAL NEGATIVE-SMOKE SURFACE CHECKS" -ForegroundColor Cyan

$Rows = @()

$RoutePath = ".\app\api\hx2\main-chat-ui-adapter-proof\route.ts"
$RouteText = Get-Hx2Text -Path $RoutePath

if ($RouteText -match "POST" -and $RouteText -match "main-chat-ui-adapter") {
  $Rows += New-Hx2Row -Check "Adapter proof POST route" -Status "GREEN" -Detail "main chat UI adapter proof route exists"
} else {
  $Rows += New-Hx2Row -Check "Adapter proof POST route" -Status "RED" -Detail "main chat UI adapter proof route missing expected markers"
}

$PackageText = Get-Hx2Text -Path ".\package.json"

foreach ($ScriptName in @("hx2:retail-chat:verify", "hx2:retail-chat:verify:awareness")) {
  if ($PackageText -match [regex]::Escape($ScriptName)) {
    $Rows += New-Hx2Row -Check "Package script $ScriptName" -Status "GREEN" -Detail "script present"
  } else {
    $Rows += New-Hx2Row -Check "Package script $ScriptName" -Status "RED" -Detail "script missing"
  }
}

$Rows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE NEGATIVE / ERROR-STATE PROBES" -ForegroundColor Cyan

$ProbeRows = @()

if ($LocalOnly) {
  $ProbeRows += New-Hx2ProbeRow -Case "empty prompt" -StatusCode 0 -Expected "no_5xx_safe_error_or_answer" -Status "SKIPPED" -Detail "local-only mode"
  $ProbeRows += New-Hx2ProbeRow -Case "whitespace prompt" -StatusCode 0 -Expected "no_5xx_safe_error_or_answer" -Status "SKIPPED" -Detail "local-only mode"
  $ProbeRows += New-Hx2ProbeRow -Case "missing message field" -StatusCode 0 -Expected "no_5xx_safe_error_or_answer" -Status "SKIPPED" -Detail "local-only mode"
  $ProbeRows += New-Hx2ProbeRow -Case "malformed JSON body" -StatusCode 0 -Expected "no_5xx_safe_error_or_answer" -Status "SKIPPED" -Detail "local-only mode"
  $ProbeRows += New-Hx2ProbeRow -Case "very long prompt" -StatusCode 0 -Expected "no_5xx_safe_error_or_answer" -Status "SKIPPED" -Detail "local-only mode"
  $ProbeRows += New-Hx2ProbeRow -Case "normal recovery prompt" -StatusCode 0 -Expected "normal_recovery_2xx_answer" -Status "SKIPPED" -Detail "local-only mode"
} else {
  $ProbeRows += Test-Hx2Probe -Case "empty prompt" -Body (@{ message = ""; request_id = "hx2-negative-empty" } | ConvertTo-Json -Depth 20) -Expected "no_5xx_safe_error_or_answer"
  $ProbeRows += Test-Hx2Probe -Case "whitespace prompt" -Body (@{ message = "     "; request_id = "hx2-negative-whitespace" } | ConvertTo-Json -Depth 20) -Expected "no_5xx_safe_error_or_answer"
  $ProbeRows += Test-Hx2Probe -Case "missing message field" -Body (@{ request_id = "hx2-negative-missing-message" } | ConvertTo-Json -Depth 20) -Expected "no_5xx_safe_error_or_answer"
  $ProbeRows += Test-Hx2Probe -Case "malformed JSON body" -Body '{"message":' -Expected "no_5xx_safe_error_or_answer"
  $ProbeRows += Test-Hx2Probe -Case "very long prompt" -Body (@{ message = ("Retail safe long prompt smoke. " + ("x" * 6000)); request_id = "hx2-negative-long" } | ConvertTo-Json -Depth 20) -Expected "no_5xx_safe_error_or_answer"
  $ProbeRows += Test-Hx2Probe -Case "normal recovery prompt" -Body (@{ message = "Return one short retail-safe sentence confirming chat recovered after negative-input probes."; request_id = "hx2-negative-recovery" } | ConvertTo-Json -Depth 20) -Expected "normal_recovery_2xx_answer"
}

$ProbeRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CHAT NEGATIVE / ERROR-STATE RESULT" -ForegroundColor Cyan

$AllStatuses = @()
$AllStatuses += $Rows
$AllStatuses += $ProbeRows

$Green = @($AllStatuses | Where-Object Status -eq "GREEN").Count
$Yellow = @($AllStatuses | Where-Object Status -eq "YELLOW").Count
$Red = @($AllStatuses | Where-Object Status -eq "RED").Count
$Skipped = @($AllStatuses | Where-Object Status -eq "SKIPPED").Count
$Total = @($AllStatuses).Count

[pscustomobject]@{
  Green = "$Green / $Total"
  Yellow = "$Yellow / $Total"
  Red = "$Red / $Total"
  Skipped = "$Skipped / $Total"
  Meaning = "This proves bad chat inputs do not cause 5xx crashes or internal leaks, and a normal prompt still recovers afterward."
  Next = "If green, add this negative smoke to the retail chat verification bundle in the next sprint."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllStatuses | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat negative/error-state smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllStatuses | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail chat negative/error-state strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat negative/error-state smoke complete" -ForegroundColor Green
