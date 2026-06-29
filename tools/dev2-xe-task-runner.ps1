param(
  [string]$Path = ".\tools\dev2-xe-task-manifest.template.json",
  [switch]$Approve,
  [switch]$RunAllowedGates
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE CONTROLLED TASK RUNNER =="
Write-Host "Manifest: $Path"
Write-Host "Approve: $Approve"
Write-Host "RunAllowedGates: $RunAllowedGates"
Write-Host "Mode: controlled execution shell"
Write-Host "Secrets printed: false"

if (-not (Test-Path $Path)) {
  throw "Missing DEV2-XE task manifest: $Path"
}

Write-Host ""
Write-Host "== VALIDATE MANIFEST =="
npm run dev2:xe:manifest -- -Path $Path
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE task manifest validation failed." }

Write-Host ""
Write-Host "== DEV2-XE PREFLIGHT =="
npm run dev2:xe:preflight
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE preflight failed." }

Write-Host ""
Write-Host "== NO AUTO-RELEASE CHECK =="
npm run dev2:xe:no-auto-release
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE no auto-release guard failed." }

$Raw = Get-Content $Path -Raw
$Manifest = $Raw | ConvertFrom-Json

Write-Host ""
Write-Host "== TASK MANIFEST SUMMARY =="
[pscustomobject]@{
  Schema = $Manifest.schema
  Phase = $Manifest.phase
  Title = $Manifest.title
  Mode = $Manifest.mode
  Risk = $Manifest.risk
  OwnerApprovalRequired = [bool]$Manifest.ownerApprovalRequired
  AutoPushAllowed = [bool]$Manifest.autoPushAllowed
  AutoDeployAllowed = [bool]$Manifest.autoDeployAllowed
} | Format-List

if ([bool]$Manifest.autoPushAllowed -ne $false) {
  throw "Manifest rejected: autoPushAllowed must be false."
}

if ([bool]$Manifest.autoDeployAllowed -ne $false) {
  throw "Manifest rejected: autoDeployAllowed must be false."
}

if ([bool]$Manifest.ownerApprovalRequired -ne $true) {
  throw "Manifest rejected: ownerApprovalRequired must be true."
}

if (-not $Approve) {
  Write-Host ""
  Write-Host "YELLOW: task manifest validated, but execution approval was not provided."
  Write-Host "GREEN: DEV2-XE controlled task runner stopped safely before execution."
  exit 0
}

if ($Manifest.mode -ne "inspection" -and $Manifest.risk -ne "low") {
  throw "Only low-risk inspection manifests are allowed in the initial task runner shell."
}

if (-not $RunAllowedGates) {
  Write-Host ""
  Write-Host "GREEN: task approved, but RunAllowedGates was not requested. No task gates executed."
  exit 0
}

Write-Host ""
Write-Host "== RUN ALLOWLISTED TASK GATES =="

$AllowedGateMap = @{
  "dev2:xe:preflight" = { npm run dev2:xe:preflight }
  "npx tsc --noEmit --pretty false" = { npx tsc --noEmit --pretty false }
  "hx2:verify:policy" = { npm run hx2:verify:policy }
}

foreach ($Gate in @($Manifest.requiredGates)) {
  $GateText = [string]$Gate

  if (-not $AllowedGateMap.ContainsKey($GateText)) {
    throw "Gate is not allowlisted for controlled execution: $GateText"
  }

  Write-Host ""
  Write-Host "== TASK GATE: $GateText =="
  & $AllowedGateMap[$GateText]
  if ($LASTEXITCODE -ne 0) {
    throw "Task gate failed: $GateText"
  }
}

Write-Host ""
Write-Host "== DEV2-XE TASK RUNNER SUMMARY =="
[pscustomobject]@{
  Manifest = $Path
  Approved = [bool]$Approve
  GatesExecuted = [bool]$RunAllowedGates
  AutoPush = "blocked"
  AutoDeploy = "blocked"
  Meaning = "DEV2-XE executed only allowlisted gates from a validated low-risk inspection manifest."
} | Format-List

Write-Host "GREEN: DEV2-XE controlled task runner passed."

