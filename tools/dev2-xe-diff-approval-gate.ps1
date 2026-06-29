param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE DIFF APPROVAL GATE =="
Write-Host "Strict: $Strict"
Write-Host "Mode: review-only"
Write-Host "Secrets printed: false"

$Status = @(git status --short)

$Rows = @()

function Add-Row {
  param(
    [string]$Path,
    [string]$StatusCode,
    [string]$Risk,
    [string]$Reason,
    [string]$RequiredApproval
  )

  $script:Rows += [pscustomobject]@{
    Path = $Path
    StatusCode = $StatusCode
    Risk = $Risk
    Reason = $Reason
    RequiredApproval = $RequiredApproval
  }
}

if (-not $Status -or $Status.Count -eq 0) {
  Write-Host ""
  Write-Host "GREEN: working tree clean. No diff approval required."
  exit 0
}

foreach ($Line in $Status) {
  $StatusCode = $Line.Substring(0, 2).Trim()
  $Path = $Line.Substring(3).Trim()

  $Risk = "LOW"
  $Reason = "tooling/docs or low-risk surface"
  $Approval = "standard commit approval"

  if ($Path -match "^app/api/.*/route\.ts$") {
    $Risk = "HIGH"
    $Reason = "API route/runtime behavior surface"
    $Approval = "single-sprint approval + typecheck + build + route smoke + post-deploy if runtime changed"
  } elseif ($Path -match "^app/.*\.(tsx|ts)$") {
    $Risk = "MEDIUM"
    $Reason = "application TypeScript/UI/runtime surface"
    $Approval = "typecheck + build + relevant smoke"
  } elseif ($Path -match "^package\.json$|^package-lock\.json$|^next\.config|^tsconfig") {
    $Risk = "HIGH"
    $Reason = "package/config/build surface"
    $Approval = "full quick verify before commit"
  } elseif ($Path -match "^prisma/|schema\.prisma|\.env") {
    $Risk = "CRITICAL"
    $Reason = "database/schema/env/secrets surface"
    $Approval = "manual approval only; no bundled sprint"
  } elseif ($Path -match "^tools/.*\.ps1$") {
    $Risk = "LOW"
    $Reason = "PowerShell tooling surface"
    $Approval = "policy guard + relevant verify"
  } elseif ($Path -match "^tools/.*\.(md|json|txt)$|\.md$") {
    $Risk = "LOW"
    $Reason = "docs/status/manifest surface"
    $Approval = "standard commit approval"
  }

  Add-Row -Path $Path -StatusCode $StatusCode -Risk $Risk -Reason $Reason -RequiredApproval $Approval
}

Write-Host ""
Write-Host "CHANGED FILE RISK MAP"
$Rows | Format-Table -AutoSize

$Critical = @($Rows | Where-Object { $_.Risk -eq "CRITICAL" }).Count
$High = @($Rows | Where-Object { $_.Risk -eq "HIGH" }).Count
$Medium = @($Rows | Where-Object { $_.Risk -eq "MEDIUM" }).Count
$Low = @($Rows | Where-Object { $_.Risk -eq "LOW" }).Count

Write-Host ""
Write-Host "DEV2-XE DIFF APPROVAL SUMMARY"
[pscustomobject]@{
  Critical = $Critical
  High = $High
  Medium = $Medium
  Low = $Low
  ChangedFiles = $Rows.Count
  Meaning = "This gate classifies changed files before commit so DEV2-XE can require the right approval and verification level."
} | Format-List

if ($Critical -gt 0) {
  throw "CRITICAL diff detected. Manual single-sprint approval required."
}

if ($Strict -and $High -gt 0) {
  throw "HIGH-risk diff detected under Strict mode."
}

Write-Host "GREEN: DEV2-XE diff approval gate passed."

