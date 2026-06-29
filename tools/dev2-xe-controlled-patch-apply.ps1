param(
  [string]$Path = ".\tools\dev2-xe-controlled-patch.sample.json",
  [switch]$Approve,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE CONTROLLED PATCH APPLY =="
Write-Host "PatchPlan: $Path"
Write-Host "Approve: $Approve"
Write-Host "WhatIfOnly: $WhatIfOnly"
Write-Host "Mode: controlled low-risk patch apply"
Write-Host "Secrets printed: false"

if (-not (Test-Path $Path)) {
  throw "Missing patch plan: $Path"
}

Write-Host ""
Write-Host "== DEV2-XE PREFLIGHT =="
npm run dev2:xe:preflight
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE preflight failed." }

Write-Host ""
Write-Host "== DEV2-XE PATCH PLAN GUARD =="
npm run dev2:xe:patch-plan -- -Path $Path
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE patch plan guard failed." }

Write-Host ""
Write-Host "== DEV2-XE NO AUTO-RELEASE GUARD =="
npm run dev2:xe:no-auto-release
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE no auto-release guard failed." }

$Raw = Get-Content $Path -Raw
$Plan = $Raw | ConvertFrom-Json

if ([bool]$Plan.ownerApprovalRequired -ne $true) {
  throw "Patch plan rejected: ownerApprovalRequired must be true."
}

if ([bool]$Plan.autoPushAllowed -ne $false) {
  throw "Patch plan rejected: autoPushAllowed must be false."
}

if ([bool]$Plan.autoDeployAllowed -ne $false) {
  throw "Patch plan rejected: autoDeployAllowed must be false."
}

if ($Plan.risk -ne "low") {
  throw "Initial controlled patch apply only allows low-risk plans."
}

$AllowedSurfaces = @($Plan.allowedSurfaces)
$Files = @($Plan.files)
$Rows = @()

function Get-Surface {
  param([string]$FilePath)

  if ($FilePath -match "^tools/") { return "tools" }
  if ($FilePath -match "^docs/|\.md$") { return "docs" }
  if ($FilePath -match "^package\.json$") { return "package-scripts" }
  if ($FilePath -match "^app/api/.*/route\.ts$") { return "route" }
  if ($FilePath -match "^app/") { return "app" }
  if ($FilePath -match "^prisma/|schema\.prisma") { return "db" }

  return "other"
}

foreach ($File in $Files) {
  $TargetPath = [string]$File.path
  $SourcePath = [string]$File.sourcePath
  $Operation = [string]$File.operation
  $FileRisk = [string]$File.risk
  $Surface = Get-Surface -FilePath $TargetPath

  if ([string]::IsNullOrWhiteSpace($TargetPath)) { throw "Patch file is missing path." }
  if ([string]::IsNullOrWhiteSpace($SourcePath)) { throw "Patch file is missing sourcePath for target: $TargetPath" }
  if ($TargetPath -match "^\s*[A-Za-z]:|\.\.|\.env") { throw "Unsafe target path: $TargetPath" }
  if ($SourcePath -match "^\s*[A-Za-z]:|\.\.|\.env") { throw "Unsafe source path: $SourcePath" }
  if ($Operation -ne "create" -and $Operation -ne "update") { throw "Initial controlled patch apply only supports create/update: $TargetPath" }
  if ($FileRisk -ne "low") { throw "Initial controlled patch apply only supports low-risk files: $TargetPath" }
  if (-not ($AllowedSurfaces -contains $Surface)) { throw "Target surface is not allowed: $TargetPath -> $Surface" }
  if (-not (Test-Path $SourcePath)) { throw "Patch source file not found: $SourcePath" }

  $Exists = Test-Path $TargetPath

  if ($Operation -eq "create" -and $Exists) {
    throw "Create operation refused because target already exists: $TargetPath"
  }

  if ($Operation -eq "update" -and -not $Exists) {
    throw "Update operation refused because target does not exist: $TargetPath"
  }

  $Rows += [pscustomobject]@{
    Operation = $Operation
    Surface = $Surface
    Risk = $FileRisk
    SourcePath = $SourcePath
    TargetPath = $TargetPath
  }
}

Write-Host ""
Write-Host "PATCH APPLY PLAN"
$Rows | Format-Table -AutoSize

if (-not $Approve) {
  Write-Host ""
  Write-Host "YELLOW: patch plan validated, but -Approve was not supplied."
  Write-Host "GREEN: controlled patch apply stopped safely before file changes."
  exit 0
}

if ($WhatIfOnly) {
  Write-Host ""
  Write-Host "GREEN: WhatIfOnly requested. No files changed."
  exit 0
}

foreach ($Row in $Rows) {
  $TargetDir = Split-Path $Row.TargetPath -Parent
  if (-not [string]::IsNullOrWhiteSpace($TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
  }

  Copy-Item -Path $Row.SourcePath -Destination $Row.TargetPath -Force
  Write-Host "GREEN: applied $($Row.Operation) -> $($Row.TargetPath)"
}

Write-Host ""
Write-Host "== STATUS AFTER CONTROLLED PATCH APPLY =="
git status --short

Write-Host ""
Write-Host "GREEN: DEV2-XE controlled patch apply completed. Review diff before commit."

