param(
  [string]$File = ".\tools\canonical\owner-actions-page.canonical.tsx"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $File)) {
  throw "FAIL: file not found: $File"
}

$content = Get-Content $File -Raw

$checks = @(
  @{ Name = "pollRemoteTask"; Pattern = 'async function pollRemoteTask\('; Expected = 1 },
  @{ Name = "runFollowUpAction"; Pattern = 'async function runFollowUpAction\('; Expected = 1 },
  @{ Name = "FOLLOWUP_CAPABILITY_MAP"; Pattern = 'const FOLLOWUP_CAPABILITY_MAP'; Expected = 1 },
  @{ Name = "getFollowUpCapability"; Pattern = 'function getFollowUpCapability\('; Expected = 1 },
  @{ Name = "getFollowUpCapabilityLabel"; Pattern = 'function getFollowUpCapabilityLabel\('; Expected = 1 },
  @{ Name = "Remote Task Result"; Pattern = 'Remote Task Result'; Expected = 1 },
  @{ Name = "Operator Prompt"; Pattern = 'Operator Prompt'; Expected = 1 },
  @{ Name = "Priority Action"; Pattern = 'Priority Action'; Expected = 1 },
  @{ Name = "Recent Action History"; Pattern = 'Recent Action History'; Expected = 1 }
)

$failed = $false
$rows = foreach ($check in $checks) {
  $count = [regex]::Matches($content, $check.Pattern).Count
  $ok = ($count -eq $check.Expected)

  if (-not $ok) { $failed = $true }

  [pscustomobject]@{
    Check    = $check.Name
    Expected = $check.Expected
    Actual   = $count
    Status   = if ($ok) { "PASS" } else { "FAIL" }
  }
}

$rows | Format-Table -AutoSize

if ($failed) {
  throw "FAIL: owner actions preflight failed"
}

Write-Host "Owner actions preflight passed" -ForegroundColor Green



