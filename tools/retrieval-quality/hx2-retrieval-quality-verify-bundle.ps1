param(
  [string]$Base = "https://optinodeiq.com",
  [switch]$StrictTrust
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETRIEVAL QUALITY VERIFY BUNDLE =="
Write-Host "Base: $Base"
Write-Host "StrictTrust: $StrictTrust"
Write-Host "Mode: retrieval relevance + source trust + source evidence + definition source authority"
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
$ScoringGuardFile = ".\tools\retrieval-quality\hx2-retrieval-source-trust-scoring-guard.ps1"
$EvidenceContractGuardFile = ".\tools\retrieval-quality\hx2-source-evidence-contract-guard.ps1"
$EvidenceDomainGuardFile = ".\tools\retrieval-quality\hx2-source-evidence-domain-normalization-guard.ps1"
$EvidencePublisherGuardFile = ".\tools\retrieval-quality\hx2-source-evidence-publisher-attribution-guard.ps1"
$DefinitionSourceGuardFile = ".\tools\retrieval-quality\hx2-authoritative-definition-source-preference-guard.ps1"

$RequiredFiles = @(
  @{ Label = "retrieval quality smoke"; Path = $SmokeFile },
  @{ Label = "retrieval source trust radar"; Path = $TrustFile },
  @{ Label = "retrieval source trust scoring guard"; Path = $ScoringGuardFile },
  @{ Label = "source evidence contract guard"; Path = $EvidenceContractGuardFile },
  @{ Label = "source evidence domain normalization guard"; Path = $EvidenceDomainGuardFile },
  @{ Label = "source evidence publisher attribution guard"; Path = $EvidencePublisherGuardFile },
  @{ Label = "authoritative definition source preference guard"; Path = $DefinitionSourceGuardFile }
)

foreach ($RequiredFile in $RequiredFiles) {
  if (-not (Test-Path $RequiredFile.Path)) {
    throw "Missing $($RequiredFile.Label): $($RequiredFile.Path)"
  }
}

Run-Step -Label "Retrieval quality smoke" -Meaning "Confirms live retrieval still returns relevant answers for XRP, DTCC, and XLM/DTCC cases." -Command {
  & $SmokeFile -Base $Base
}

Run-Step -Label "Retrieval source trust radar" -Meaning "Classifies source quality using curated source evidence and flags watchlist or unknown trust state." -Command {
  if ($StrictTrust) {
    & $TrustFile -Base $Base -Strict
  } else {
    & $TrustFile -Base $Base
  }
}

Run-Step -Label "Retrieval source trust scoring guard" -Meaning "Confirms runtime retrieval scoring includes source-trust tiers and watchlist demotion logic." -Command {
  & $ScoringGuardFile
}

Run-Step -Label "Source evidence contract guard" -Meaning "Confirms chat-master exposes structured source evidence while preserving visible answer fields." -Command {
  & $EvidenceContractGuardFile
}

Run-Step -Label "Source evidence domain normalization guard" -Meaning "Confirms Google News relay URLs are not treated as publisher domains when real publisher signals exist." -Command {
  & $EvidenceDomainGuardFile
}

Run-Step -Label "Source evidence publisher attribution guard" -Meaning "Confirms evidence domain attribution prioritizes explicit publisher/source over topic words in titles." -Command {
  & $EvidencePublisherGuardFile
}

Run-Step -Label "Authoritative definition source preference guard" -Meaning "Confirms definition-only retrieval includes local authoritative definitions before Wikipedia so official domains can rank first." -Command {
  & $DefinitionSourceGuardFile
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
  Meaning = "This bundle verifies retrieval relevance, source trust, runtime source scoring, structured source evidence integrity, and authoritative definition source preference."
} | Format-List

if ($Red -gt 0) {
  throw "HX2 retrieval quality verify bundle failed."
}

Write-Host "GREEN: HX2 retrieval quality verify bundle passed."

