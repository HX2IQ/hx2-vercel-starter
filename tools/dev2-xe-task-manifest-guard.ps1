param(
  [string]$Path = ".\tools\dev2-xe-task-manifest.template.json"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE TASK MANIFEST GUARD =="
Write-Host "Path: $Path"
Write-Host "Mode: validation-only"
Write-Host "Secrets printed: false"

if (-not (Test-Path $Path)) {
  throw "Missing DEV2-XE task manifest: $Path"
}

$Raw = Get-Content $Path -Raw
$Manifest = $Raw | ConvertFrom-Json

$Rows = @()

function Add-Check {
  param(
    [string]$Check,
    [bool]$Passed,
    [string]$Detail
  )

  $script:Rows += [pscustomobject]@{
    Check = $Check
    Status = if ($Passed) { "GREEN" } else { "RED" }
    Detail = $Detail
  }
}

$RequiredFields = @(
  "schema",
  "phase",
  "title",
  "mode",
  "risk",
  "ownerApprovalRequired",
  "autoPushAllowed",
  "autoDeployAllowed",
  "allowedSurfaces",
  "requiredGates"
)

foreach ($Field in $RequiredFields) {
  $HasField = $Manifest.PSObject.Properties.Name -contains $Field
  Add-Check -Check "field:$Field" -Passed $HasField -Detail $(if ($HasField) { "present" } else { "missing" })
}

Add-Check -Check "schema" -Passed ($Manifest.schema -eq "dev2-xe-task-manifest/v1") -Detail "expected dev2-xe-task-manifest/v1"
Add-Check -Check "ownerApprovalRequired" -Passed ([bool]$Manifest.ownerApprovalRequired -eq $true) -Detail "must require owner approval"
Add-Check -Check "autoPushAllowed" -Passed ([bool]$Manifest.autoPushAllowed -eq $false) -Detail "auto-push must be false"
Add-Check -Check "autoDeployAllowed" -Passed ([bool]$Manifest.autoDeployAllowed -eq $false) -Detail "auto-deploy must be false"

$ValidRisks = @("low", "medium", "high", "critical")
Add-Check -Check "risk" -Passed ($ValidRisks -contains $Manifest.risk) -Detail "must be low, medium, high, or critical"

$AllowedModes = @("inspection", "patch", "verify", "release-lock")
Add-Check -Check "mode" -Passed ($AllowedModes -contains $Manifest.mode) -Detail "must be inspection, patch, verify, or release-lock"

$RequiredGateNames = @(
  "dev2:xe:preflight",
  "npx tsc --noEmit --pretty false",
  "hx2:verify:policy"
)

foreach ($GateName in $RequiredGateNames) {
  $HasGate = @($Manifest.requiredGates) -contains $GateName
  Add-Check -Check "gate:$GateName" -Passed $HasGate -Detail $(if ($HasGate) { "present" } else { "missing" })
}

Write-Host ""
Write-Host "TASK MANIFEST CHECKS"
$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "DEV2-XE TASK MANIFEST SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Meaning = "This guard validates task manifests before DEV2-XE execution automation is allowed."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2-XE task manifest guard failed."
}

Write-Host "GREEN: DEV2-XE task manifest guard passed."

