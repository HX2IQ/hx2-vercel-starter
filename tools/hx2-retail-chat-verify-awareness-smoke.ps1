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
Write-Host "== HX2 RETAIL CHAT VERIFY AWARENESS SMOKE ==" -ForegroundColor Cyan
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
    "systemPrompt"
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

Write-Host ""

function Invoke-Hx2JsonWithRetry {
  param(
    [string]$Uri,
    [int]$Attempts = 3,
    [int]$TimeoutSec = 75
  )

  $LastError = ""

  for ($Try = 1; $Try -le $Attempts; $Try++) {
    try {
      Write-Host ("GET attempt {0}/{1}: {2}" -f $Try, $Attempts, $Uri)
      return Invoke-RestMethod -Uri $Uri -Method GET -TimeoutSec $TimeoutSec
    } catch {
      $LastError = $_.Exception.Message

      if ($Try -lt $Attempts) {
        Start-Sleep -Seconds (5 * $Try)
      }
    }
  }

  throw "GET failed after $Attempts attempts: $LastError"
}
Write-Host "LOCAL AWARENESS CHECKS" -ForegroundColor Cyan

$Rows = @()

$Bundle = ".\tools\hx2-retail-chat-verification-bundle.ps1"
$BundleText = Get-Hx2Text -Path $Bundle

if (
  $BundleText -match "HX2 RETAIL CHAT VERIFICATION BUNDLE" -and
  $BundleText -match "hx2:main-chat:user-flow" -and
  $BundleText -match "hx2:embedded-chat:wiring" -and
  $BundleText -match "hx2:retail-chat:negative" -and
  $BundleText -match "hx2:retail-chat:browser-prep" -and
  $BundleText -match "hx2:chat-endpoints:allowlist" -and
  $BundleText -match "hx2:verify:auto"
) {
  $Rows += New-Hx2Row -Check "Retail chat bundle script" -Status "GREEN" -Detail "bundle script and child verification markers found"
} else {
  $Rows += New-Hx2Row -Check "Retail chat bundle script" -Status "RED" -Detail "bundle script or child verification markers missing"
}

$PackageText = Get-Hx2Text -Path ".\package.json"

foreach ($ScriptName in @("hx2:retail-chat:verify", "hx2:retail-chat:verify:local", "hx2:retail-chat:verify:strict")) {
  if ($PackageText -match [regex]::Escape($ScriptName)) {
    $Rows += New-Hx2Row -Check "Package script $ScriptName" -Status "GREEN" -Detail "script present"
  } else {
    $Rows += New-Hx2Row -Check "Package script $ScriptName" -Status "RED" -Detail "script missing"
  }
}

$Route = ".\app\api\hx2\retail-chat-verify-status\route.ts"
$RouteText = Get-Hx2Text -Path $Route

if ($RouteText -match "read_only_retail_chat_verify_status" -and $RouteText -match "safe_metadata_only_no_brain_logic") {
  $Rows += New-Hx2Row -Check "Retail chat status route" -Status "GREEN" -Detail "safe metadata route present"
} else {
  $Rows += New-Hx2Row -Check "Retail chat status route" -Status "RED" -Detail "route markers missing"
}

$VerifyStatus = ".\tools\hx2-verify-status.ps1"
$VerifyText = Get-Hx2Text -Path $VerifyStatus

if ($VerifyText -match "hx2:retail-chat:verify") {
  $Rows += New-Hx2Row -Check "Verify dashboard awareness" -Status "GREEN" -Detail "verify dashboard mentions retail chat verify"
} else {
  $Rows += New-Hx2Row -Check "Verify dashboard awareness" -Status "YELLOW" -Detail "verify dashboard does not mention retail chat verify"
}

$Rows | Format-Table -AutoSize

Write-Host ""
Write-Host "LIVE AWARENESS SURFACE" -ForegroundColor Cyan

$LiveRows = @()

if ($LocalOnly) {
  $LiveRows += New-Hx2Row -Check "GET retail chat verify status" -Status "SKIPPED" -Detail "local-only mode"
} else {
  try {
    $Result = Invoke-Hx2JsonWithRetry -Uri "$Base/api/hx2/retail-chat-verify-status" -Attempts 3 -TimeoutSec 75
    $Json = $Result | ConvertTo-Json -Depth 20
    $Leak = Test-Hx2NoInternalLeak -Text $Json

    if ($Leak) {
      $LiveRows += New-Hx2Row -Check "GET retail chat verify status" -Status "RED" -Detail $Leak
    } elseif ($Json -match "read_only_retail_chat_verify_status" -and $Json -match "npm run hx2:retail-chat:verify") {
      $LiveRows += New-Hx2Row -Check "GET retail chat verify status" -Status "GREEN" -Detail "live safe metadata route returned bundle command"
    } else {
      $LiveRows += New-Hx2Row -Check "GET retail chat verify status" -Status "RED" -Detail "live route missing expected bundle metadata"
    }
  } catch {
    $LiveRows += New-Hx2Row -Check "GET retail chat verify status" -Status "RED" -Detail $_.Exception.Message
  }
}

$LiveRows | Format-Table -AutoSize

Write-Host ""
Write-Host "RETAIL CHAT VERIFY AWARENESS RESULT" -ForegroundColor Cyan

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
  Meaning = "This proves the retail chat verification bundle is discoverable through package scripts, verify-status awareness, and safe metadata route."
  Next = "Keep npm run hx2:retail-chat:verify as the standard preflight before chat/UI changes."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $AllRows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat verify awareness smoke found red checks."
}

if ($Strict -and $Yellow -gt 0) {
  Write-Host ""
  Write-Host "YELLOW CHECK DETAILS" -ForegroundColor Yellow
  $AllRows | Where-Object Status -eq "YELLOW" | Format-List
  throw "Retail chat verify awareness strict smoke found yellow checks."
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
Write-Host "GREEN: retail chat verify awareness smoke complete" -ForegroundColor Green

