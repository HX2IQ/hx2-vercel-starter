param(
  [string]$Base = "https://optinodeiq.com",
  [switch]$StrictTrust
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETRIEVAL QUALITY VERIFY BUNDLE =="
Write-Host "Base: $Base"
Write-Host "StrictTrust: $StrictTrust"
Write-Host "Mode: retrieval relevance + source trust"
Write-Host "Secrets printed: false"

$Results = @()

function Add-Result {
  param(
    [string]$Check,
    [string]$Status,
    [string]$Meaning
  )

  $script:Results += [pscustomobject]@{
    Check = $Check
    Status = $Status
    Meaning = $Meaning
  }
}

function Run-Step {
  param(
    [string]$Label,
    [scriptblock]$Command,
    [string]$Meaning
  )

  Write-Host ""
  Write-Host "== $Label =="

  $global:LASTEXITCODE = 0

  try {
    & $Command
  } catch {
    Add-Result -Check $Label -Status "RED" -Meaning $Meaning
    throw
  }

  $ExitCode = $global:LASTEXITCODE

  if ($ExitCode -ne 0) {
    Add-Result -Check $Label -Status "RED" -Meaning $Meaning
    throw "$Label failed with exit code $ExitCode."
  }

  Add-Result -Check $Label -Status "GREEN" -Meaning $Meaning
}

$SmokeFile = ".\tools\retrieval-quality-smoke.ps1"
$TrustFile = ".\tools\retrieval-quality\hx2-retrieval-source-trust-radar.ps1"

if (-not (Test-Path $SmokeFile)) {
  throw "Missing retrieval quality smoke: $SmokeFile"
}

if (-not (Test-Path $TrustFile)) {
  throw "Missing retrieval source trust radar: $TrustFile"
}

Run-Step -Label "Retrieval quality smoke" -Meaning "Confirms live retrieval still returns relevant answers for XRP, DTCC, and XLM/DTCC cases." -Command {
  & $SmokeFile -Base $Base
}

Run-Step -Label "Retrieval source trust radar" -Meaning "Classifies source quality and flags watchlist sources without failing non-strict mode." -Command {
  if ($StrictTrust) {
    & $TrustFile -Base $Base -Strict
  } else {
    & $TrustFile -Base $Base
  }
}

Write-Host ""
Write-Host "RETRIEVAL QUALITY VERIFY RESULTS"
$Results | Format-Table -AutoSize

$Red = @($Results | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Results | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "RETRIEVAL QUALITY VERIFY SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  StrictTrust = [bool]$StrictTrust
  Meaning = "This bundle verifies both retrieval relevance and retrieval source trust."
} | Format-List

if ($Red -gt 0) {
  throw "HX2 retrieval quality verify bundle failed."
}

Write-Host "GREEN: HX2 retrieval quality verify bundle passed."

