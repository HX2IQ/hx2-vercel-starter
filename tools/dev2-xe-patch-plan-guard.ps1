param(
  [string]$Path = ".\tools\dev2-xe-patch-plan.template.json",
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE PATCH PLAN GUARD =="
Write-Host "Path: $Path"
Write-Host "Strict: $Strict"
Write-Host "Mode: validation-only"
Write-Host "Secrets printed: false"

if (-not (Test-Path $Path)) {
  throw "Missing DEV2-XE patch plan: $Path"
}

$Raw = Get-Content $Path -Raw
$Plan = $Raw | ConvertFrom-Json

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
  "files",
  "requiredGates"
)

foreach ($Field in $RequiredFields) {
  $HasField = $Plan.PSObject.Properties.Name -contains $Field
  Add-Check -Check "field:$Field" -Passed $HasField -Detail $(if ($HasField) { "present" } else { "missing" })
}

Add-Check -Check "schema" -Passed ($Plan.schema -eq "dev2-xe-patch-plan/v1") -Detail "expected dev2-xe-patch-plan/v1"
Add-Check -Check "ownerApprovalRequired" -Passed ([bool]$Plan.ownerApprovalRequired -eq $true) -Detail "must require owner approval"
Add-Check -Check "autoPushAllowed" -Passed ([bool]$Plan.autoPushAllowed -eq $false) -Detail "auto-push must be false"
Add-Check -Check "autoDeployAllowed" -Passed ([bool]$Plan.autoDeployAllowed -eq $false) -Detail "auto-deploy must be false"

$ValidRisks = @("low", "medium", "high", "critical")
Add-Check -Check "risk" -Passed ($ValidRisks -contains $Plan.risk) -Detail "must be low, medium, high, or critical"

$AllowedModes = @("patch-plan")
Add-Check -Check "mode" -Passed ($AllowedModes -contains $Plan.mode) -Detail "must be patch-plan"

$AllowedSurfaces = @($Plan.allowedSurfaces)
$Files = @()
if ($Plan.PSObject.Properties.Name -contains "files" -and $null -ne $Plan.files) {
  $Files = @($Plan.files)
}

Add-Check -Check "files" -Passed ($Files.Count -gt 0) -Detail "must include at least one planned file"

$ValidOperations = @("create", "update", "delete")
$CriticalCount = 0
$HighCount = 0

foreach ($File in $Files) {
  $FilePath = [string]$File.path
  $Operation = [string]$File.operation
  $FileRisk = [string]$File.risk

  Add-Check -Check "file-path:$FilePath" -Passed (-not [string]::IsNullOrWhiteSpace($FilePath)) -Detail "file path required"
  Add-Check -Check "operation:$FilePath" -Passed ($ValidOperations -contains $Operation) -Detail "operation must be create, update, or delete"
  Add-Check -Check "risk:$FilePath" -Passed ($ValidRisks -contains $FileRisk) -Detail "risk must be low, medium, high, or critical"

  $PathSafe = $true
  if ($FilePath -match "^\s*[A-Za-z]:") { $PathSafe = $false }
  if ($FilePath -match "\.\.") { $PathSafe = $false }
  if ($FilePath -match "\.env") { $PathSafe = $false }

  Add-Check -Check "safe-relative-path:$FilePath" -Passed $PathSafe -Detail "must be repo-relative and must not target env files"

  $Surface = "other"
  if ($FilePath -match "^tools/") { $Surface = "tools" }
  elseif ($FilePath -match "^docs/|\.md$") { $Surface = "docs" }
  elseif ($FilePath -match "^package\.json$") { $Surface = "package-scripts" }
  elseif ($FilePath -match "^app/api/.*/route\.ts$") { $Surface = "route" }
  elseif ($FilePath -match "^app/") { $Surface = "app" }
  elseif ($FilePath -match "^prisma/|schema\.prisma") { $Surface = "db" }

  Add-Check -Check "allowed-surface:$FilePath" -Passed ($AllowedSurfaces -contains $Surface) -Detail "surface detected: $Surface"

  if ($FileRisk -eq "critical" -or $Surface -eq "db") {
    $CriticalCount++
  }

  if ($FileRisk -eq "high" -or $Surface -eq "route") {
    $HighCount++
  }
}

$RequiredGateNames = @(
  "dev2:xe:preflight",
  "dev2:xe:patch-plan",
  "npx tsc --noEmit --pretty false",
  "hx2:verify:policy"
)

foreach ($GateName in $RequiredGateNames) {
  $HasGate = @($Plan.requiredGates) -contains $GateName
  Add-Check -Check "gate:$GateName" -Passed $HasGate -Detail $(if ($HasGate) { "present" } else { "missing" })
}

Write-Host ""
Write-Host "PATCH PLAN CHECKS"
$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "DEV2-XE PATCH PLAN SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Files = $Files.Count
  HighRiskFiles = $HighCount
  CriticalRiskFiles = $CriticalCount
  Meaning = "This guard validates patch plans before DEV2-XE controlled patch automation is allowed."
} | Format-List

if ($CriticalCount -gt 0) {
  throw "Critical patch plan detected. Manual single-sprint approval required."
}

if ($Strict -and $HighCount -gt 0) {
  throw "High-risk patch plan detected under Strict mode."
}

if ($Red -gt 0) {
  throw "DEV2-XE patch plan guard failed."
}

Write-Host "GREEN: DEV2-XE patch plan guard passed."

