param(
  [switch]$LocalOnly,
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

Write-Host ""
Write-Host "== HX2 RETAIL CHAT VERIFICATION BUNDLE ==" -ForegroundColor Cyan
Write-Host ("Local only: {0}" -f [bool]$LocalOnly)
Write-Host ("Strict:     {0}" -f [bool]$Strict)

function New-Hx2Row {
  param(
    [string]$Check,
    [string]$Command,
    [string]$Status,
    [int]$ExitCode,
    [string]$Detail
  )

  return [pscustomobject]@{
    Check = $Check
    Command = $Command
    Status = $Status
    ExitCode = $ExitCode
    Detail = $Detail
  }
}

function Resolve-Hx2Script {
  param(
    [string]$Base,
    [string]$Local,
    [string]$StrictName
  )

  if ($LocalOnly -and -not [string]::IsNullOrWhiteSpace($Local)) {
    return $Local
  }

  if ($Strict -and -not [string]::IsNullOrWhiteSpace($StrictName)) {
    return $StrictName
  }

  return $Base
}

function Invoke-Hx2NpmCheck {
  param(
    [string]$Label,
    [string]$ScriptName
  )

  $CommandText = "npm run $ScriptName"

  Write-Host ""
  Write-Host ("== {0} ==" -f $Label) -ForegroundColor Cyan
  Write-Host $CommandText

  $Output = cmd.exe /d /s /c $CommandText 2>&1
  $ExitCode = $LASTEXITCODE

  foreach ($Line in $Output) {
    Write-Host $Line
  }

  if ($ExitCode -eq 0) {
    return New-Hx2Row -Check $Label -Command $CommandText -Status "GREEN" -ExitCode $ExitCode -Detail "passed"
  }

  return New-Hx2Row -Check $Label -Command $CommandText -Status "RED" -ExitCode $ExitCode -Detail "failed"
}

$Checks = @(
  @{
    Label = "Main chat user-flow"
    Script = Resolve-Hx2Script -Base "hx2:main-chat:user-flow" -Local "hx2:main-chat:user-flow:local" -StrictName "hx2:main-chat:user-flow:strict"
  },
  @{
    Label = "Main chat UI wiring"
    Script = Resolve-Hx2Script -Base "hx2:main-chat:ui-wiring" -Local "hx2:main-chat:ui-wiring:local" -StrictName "hx2:main-chat:ui-wiring:strict"
  },
  @{
    Label = "Embedded HealthOI chat wiring"
    Script = Resolve-Hx2Script -Base "hx2:embedded-chat:wiring" -Local "hx2:embedded-chat:wiring:local" -StrictName "hx2:embedded-chat:wiring:strict"
  },
  @{
    Label = "Retail chat negative/error-state"
    Script = Resolve-Hx2Script -Base "hx2:retail-chat:negative" -Local "hx2:retail-chat:negative:local" -StrictName "hx2:retail-chat:negative:strict"
  },
  @{
    Label = "Retail chat browser-proof prep"
    Script = Resolve-Hx2Script -Base "hx2:retail-chat:browser-prep" -Local "hx2:retail-chat:browser-prep:local" -StrictName "hx2:retail-chat:browser-prep:strict"
  },
  @{
    Label = "Direct endpoint cleanup report"
    Script = Resolve-Hx2Script -Base "hx2:chat-endpoints:cleanup" -Local "hx2:chat-endpoints:cleanup" -StrictName "hx2:chat-endpoints:cleanup:strict"
  },
  @{
    Label = "Direct endpoint allowlist guard"
    Script = Resolve-Hx2Script -Base "hx2:chat-endpoints:allowlist" -Local "hx2:chat-endpoints:allowlist" -StrictName "hx2:chat-endpoints:allowlist:strict"
  },
  @{
    Label = "Chat E2E safe preview"
    Script = Resolve-Hx2Script -Base "hx2:chat:e2e" -Local "hx2:chat:e2e:local" -StrictName "hx2:chat:e2e:strict"
  },
  @{
    Label = "Answer quality participation"
    Script = Resolve-Hx2Script -Base "hx2:answer:quality" -Local "hx2:answer:quality:local" -StrictName "hx2:answer:quality:strict"
  },
  @{
    Label = "Auto verify"
    Script = "hx2:verify:auto"
  }
)

$Rows = @()

foreach ($Check in $Checks) {
  $Rows += Invoke-Hx2NpmCheck -Label $Check.Label -ScriptName $Check.Script
}

Write-Host ""
Write-Host "RETAIL CHAT VERIFICATION SUMMARY" -ForegroundColor Cyan

$Rows | Format-Table Check, Command, Status, ExitCode, Detail -AutoSize

$Green = @($Rows | Where-Object Status -eq "GREEN").Count
$Red = @($Rows | Where-Object Status -eq "RED").Count
$Total = @($Rows).Count

Write-Host ""
[pscustomobject]@{
  Green = "$Green / $Total"
  Red = "$Red / $Total"
  LocalOnly = [bool]$LocalOnly
  Strict = [bool]$Strict
  Meaning = "This bundle verifies the retail-safe chat path, negative/error handling, browser-surface readiness, direct-endpoint regression guards, E2E chat safety, answer quality, and repo verify posture."
  Next = "Run this bundle before future chat/UI changes and after deployment when chat behavior changes."
} | Format-List

if ($Red -gt 0) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS" -ForegroundColor Red
  $Rows | Where-Object Status -eq "RED" | Format-List
  throw "Retail chat verification bundle failed."
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
Write-Host "GREEN: retail chat verification bundle complete" -ForegroundColor Green
