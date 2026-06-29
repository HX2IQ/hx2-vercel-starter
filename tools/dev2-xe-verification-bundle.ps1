param(
  [switch]$Strict,
  [switch]$SkipPatchApply
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE VERIFICATION BUNDLE =="
Write-Host "Strict: $Strict"
Write-Host "SkipPatchApply: $SkipPatchApply"
Write-Host "Mode: safety-stack verification"
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

  & $Command

  if ($LASTEXITCODE -ne 0) {
    Add-Result -Check $Label -Status "RED" -Meaning $Meaning
    throw "$Label failed."
  }

  Add-Result -Check $Label -Status "GREEN" -Meaning $Meaning
}

Run-Step -Label "DEV2-XE policy guard" -Meaning "Charter and governing rules exist." -Command {
  npm run dev2:xe:policy
}

Run-Step -Label "DEV2-XE safe inspect" -Meaning "Read-only repo awareness works." -Command {
  npm run dev2:xe:inspect -- -Focus verify
}

Run-Step -Label "DEV2-XE diff gate" -Meaning "Changed-file risk mapping works." -Command {
  if ($Strict) {
    npm run dev2:xe:diff-gate -- -Strict
  } else {
    npm run dev2:xe:diff-gate
  }
}

Run-Step -Label "DEV2-XE no auto-release" -Meaning "Automatic push/deploy behavior remains blocked." -Command {
  npm run dev2:xe:no-auto-release
}

Run-Step -Label "DEV2-XE task manifest" -Meaning "Task manifest schema validates." -Command {
  npm run dev2:xe:manifest
}

Run-Step -Label "DEV2-XE task runner safe stop" -Meaning "Task runner validates and stops safely without approval." -Command {
  npm run dev2:xe:task
}

Run-Step -Label "DEV2-XE patch plan" -Meaning "Patch plan schema validates before patch automation." -Command {
  npm run dev2:xe:patch-plan
}

if (-not $SkipPatchApply) {
  Run-Step -Label "DEV2-XE patch apply safe stop" -Meaning "Patch apply validates and stops safely without approval." -Command {
    npm run dev2:xe:patch-apply
  }

  Run-Step -Label "DEV2-XE patch apply what-if" -Meaning "Patch apply can run approved dry-run without changing files." -Command {
    npm run dev2:xe:patch-apply -- -Approve -WhatIfOnly
  }
}

Run-Step -Label "HX2 verify policy" -Meaning "Repo verification policy remains available." -Command {
  npm run hx2:verify:policy
}

Write-Host ""
Write-Host "DEV2-XE VERIFICATION RESULTS"
$Results | Format-Table -AutoSize

$Red = @($Results | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Results | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "DEV2-XE VERIFICATION SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Strict = [bool]$Strict
  SkipPatchApply = [bool]$SkipPatchApply
  Meaning = "This bundle verifies the DEV2-XE safety stack before broader verify wiring."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2-XE verification bundle failed."
}

Write-Host "GREEN: DEV2-XE verification bundle passed."

