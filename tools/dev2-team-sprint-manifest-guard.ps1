$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 TEAM SPRINT MANIFEST GUARD =="
Write-Host "Mode: team-build accelerator contract"
Write-Host "Secrets printed: false"

$TemplateFile = ".\tools\dev2-team-sprint-manifest.template.json"

if (-not (Test-Path $TemplateFile)) {
  throw "Missing team sprint manifest template: $TemplateFile"
}

$Raw = Get-Content $TemplateFile -Raw
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

$Lanes = @($Manifest.lanes)
$RequiredRoles = @("Architect", "Planner", "Implementer", "QA", "Release Manager", "Docs")
$AllowedRisk = @("low", "medium", "high")
$AllowedVerify = @("fast", "full", "strict", "build")

Add-Check -Check "phase mode team" -Passed ([string]$Manifest.phase_mode -eq "team") -Detail "phase_mode must equal team"
Add-Check -Check "manifest version present" -Passed (-not [string]::IsNullOrWhiteSpace([string]$Manifest.version)) -Detail "version is required"
Add-Check -Check "sprint id present" -Passed (-not [string]::IsNullOrWhiteSpace([string]$Manifest.sprint_id)) -Detail "sprint_id is required"
Add-Check -Check "objective present" -Passed (-not [string]::IsNullOrWhiteSpace([string]$Manifest.objective)) -Detail "objective is required"
Add-Check -Check "minimum six lanes" -Passed ($Lanes.Count -ge 6) -Detail "team mode requires at least six lanes"

$Roles = @($Lanes | ForEach-Object { [string]$_.role })

foreach ($Role in $RequiredRoles) {
  Add-Check -Check "role exists: $Role" -Passed ($Roles -contains $Role) -Detail "required team role"
}

$LaneFieldFailures = @()
$RiskFailures = @()
$VerifyFailures = @()
$EmptyFileFailures = @()
$FileRecords = @()

foreach ($Lane in $Lanes) {
  $LaneId = [string]$Lane.lane_id
  $Role = [string]$Lane.role
  $Risk = [string]$Lane.risk_class
  $Verify = [string]$Lane.verify_tier
  $Files = @($Lane.files)

  if (
    [string]::IsNullOrWhiteSpace($LaneId) -or
    [string]::IsNullOrWhiteSpace($Role) -or
    [string]::IsNullOrWhiteSpace([string]$Lane.ownership) -or
    [string]::IsNullOrWhiteSpace($Risk) -or
    [string]::IsNullOrWhiteSpace($Verify)
  ) {
    $LaneFieldFailures += $LaneId
  }

  if ($AllowedRisk -notcontains $Risk) {
    $RiskFailures += "$LaneId:$Risk"
  }

  if ($AllowedVerify -notcontains $Verify) {
    $VerifyFailures += "$LaneId:$Verify"
  }

  if ($Files.Count -lt 1) {
    $EmptyFileFailures += $LaneId
  }

  foreach ($File in $Files) {
    $FileRecords += [pscustomobject]@{
      Path = [string]$File
      Lane = $LaneId
    }
  }
}

Add-Check -Check "lane required fields" -Passed ($LaneFieldFailures.Count -eq 0) -Detail (($LaneFieldFailures -join ", "))
Add-Check -Check "risk classes allowed" -Passed ($RiskFailures.Count -eq 0) -Detail (($RiskFailures -join ", "))
Add-Check -Check "verify tiers allowed" -Passed ($VerifyFailures.Count -eq 0) -Detail (($VerifyFailures -join ", "))
Add-Check -Check "lanes declare owned files" -Passed ($EmptyFileFailures.Count -eq 0) -Detail (($EmptyFileFailures -join ", "))

$ApprovedHotFiles = @()
if ($Manifest.coordination -and $Manifest.coordination.hot_files) {
  $ApprovedHotFiles = @($Manifest.coordination.hot_files | ForEach-Object { [string]$_.path })
}

$DuplicateFiles =
  $FileRecords |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_.Path) } |
    Group-Object Path |
    Where-Object { $_.Count -gt 1 }

$UnapprovedDuplicates = @(
  $DuplicateFiles |
    Where-Object { $ApprovedHotFiles -notcontains $_.Name } |
    ForEach-Object { $_.Name }
)

Add-Check -Check "hot-file collision approval" -Passed ($UnapprovedDuplicates.Count -eq 0) -Detail (($UnapprovedDuplicates -join ", "))

$ReleasePolicy = @()
if ($Manifest.coordination -and $Manifest.coordination.release_policy) {
  $ReleasePolicy = @($Manifest.coordination.release_policy)
}

$HandoffRules = @()
if ($Manifest.coordination -and $Manifest.coordination.handoff_rules) {
  $HandoffRules = @($Manifest.coordination.handoff_rules)
}

Add-Check -Check "release policy declared" -Passed ($ReleasePolicy.Count -ge 3) -Detail "requires commit/push/deploy policy"
Add-Check -Check "handoff rules declared" -Passed ($HandoffRules.Count -ge 3) -Detail "requires lane handoff rules"

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "DEV2 TEAM SPRINT MANIFEST SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Lanes = $Lanes.Count
  Meaning = "Confirms DEV2 team mode has lanes, ownership, risk class, verify tier, hot-file coordination, release policy, and handoff rules."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2 team sprint manifest guard failed."
}

Write-Host "GREEN: DEV2 team sprint manifest guard passed."

