param(
  [string]$BaselineRoot = ".\tools\baselines"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BaselineRoot)) {
  throw "Baseline root not found: $BaselineRoot"
}

function Test-BaselineComplete {
  param([string]$Dir)

  $required = @(
    "brain-status.json",
    "x2-baseline.json",
    "x2-baseline.reply.txt",
    "h2-baseline.json",
    "h2-baseline.reply.txt",
    "x2-mixed.json",
    "x2-mixed.reply.txt",
    "h2-cross.json",
    "h2-cross.reply.txt",
    "manifest.json"
  )

  foreach ($name in $required) {
    if (-not (Test-Path (Join-Path $Dir $name))) {
      return $false
    }
  }

  return $true
}

$dirs = Get-ChildItem $BaselineRoot -Directory | Sort-Object Name | Where-Object {
  Test-BaselineComplete $_.FullName
}

if ($dirs.Count -lt 2) {
  throw "Need at least 2 complete baseline folders to diff"
}

$oldDir = $dirs[$dirs.Count - 2].FullName
$newDir = $dirs[$dirs.Count - 1].FullName

Write-Host "== HX2 baseline diff ==" -ForegroundColor Cyan
Write-Host "OLD: $oldDir"
Write-Host "NEW: $newDir"
Write-Host ""

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [string]$Check,
    [string]$Status,
    [string]$Detail
  )
  $results.Add([pscustomobject]@{
    check  = $Check
    status = $Status
    detail = $Detail
  }) | Out-Null
}

function Read-Json {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  return (Get-Content $Path -Raw | ConvertFrom-Json)
}

function Read-Text {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return "" }
  return [string](Get-Content $Path -Raw)
}

function Compare-Scalar {
  param(
    [string]$Name,
    $OldValue,
    $NewValue
  )

  if ([string]$OldValue -eq [string]$NewValue) {
    Add-Result $Name "PASS" "unchanged: $NewValue"
  } else {
    Add-Result $Name "WARN" "changed: old=[$OldValue] new=[$NewValue]"
  }
}

function Compare-Contains {
  param(
    [string]$Name,
    [string]$Text,
    [string]$Needle
  )

  if ($Text -match [regex]::Escape($Needle)) {
    Add-Result $Name "PASS" "found [$Needle]"
  } else {
    Add-Result $Name "FAIL" "missing [$Needle]"
  }
}

$oldX2 = Read-Json (Join-Path $oldDir "x2-baseline.json")
$newX2 = Read-Json (Join-Path $newDir "x2-baseline.json")
$oldH2 = Read-Json (Join-Path $oldDir "h2-baseline.json")
$newH2 = Read-Json (Join-Path $newDir "h2-baseline.json")

$newX2Reply = Read-Text (Join-Path $newDir "x2-baseline.reply.txt")
$newH2Reply = Read-Text (Join-Path $newDir "h2-baseline.reply.txt")
$newX2MixedReply = Read-Text (Join-Path $newDir "x2-mixed.reply.txt")
$newH2CrossReply = Read-Text (Join-Path $newDir "h2-cross.reply.txt")

if (-not $oldX2 -or -not $newX2 -or -not $oldH2 -or -not $newH2) {
  throw "Missing required baseline JSON files in old/new directories"
}

Compare-Scalar "X2 anchor source" $oldX2.anchor_source $newX2.anchor_source
Compare-Scalar "H2 anchor source" $oldH2.anchor_source $newH2.anchor_source
Compare-Scalar "X2 direct catalyst count" $oldX2.catalyst_summary.direct_catalysts.Count $newX2.catalyst_summary.direct_catalysts.Count
Compare-Scalar "H2 direct catalyst count" $oldH2.catalyst_summary.direct_catalysts.Count $newH2.catalyst_summary.direct_catalysts.Count

Compare-Contains "X2 brief section" $newX2Reply "Brief Title"
if (
  ($newX2Reply -match "Indirect backdrop") -or
  ($newX2Reply -match "indirect backdrop") -or
  ($newX2Reply -match "market backdrop") -or
  ($newX2Reply -match "macro backdrop") -or
  ($newX2Reply -match "supportive backdrop") -or
  ($newX2Reply -match "risk-on backdrop") -or
  ($newX2Reply -match "macro support") -or
  ($newX2Reply -match "supportive macro") -or
  ($newX2Reply -match "background macro support") -or
  ($newX2Reply -match "macro environment") -or
  ($newX2Reply -match "risk appetite") -or
  ($newX2Reply -match "supports risk appetite") -or
  ($newX2Reply -match "market sentiment") -or
  ($newX2Reply -match "supportive market") -or
  ($newX2Reply -match "constructive risk environment")
) {
  Add-Result "X2 indirect backdrop wording" "PASS" "acceptable indirect-backdrop wording present"
} else {
  Add-Result "X2 indirect backdrop wording" "FAIL" "missing acceptable indirect-backdrop wording"
}
if (
  ($newX2Reply -match "Narrative support") -or
  ($newX2Reply -match "narrative support") -or
  ($newX2Reply -match "narrative") -or
  ($newX2Reply -match "geopolitical narrative") -or
  ($newX2Reply -match "lower-tier narrative")
) {
  Add-Result "X2 narrative support wording" "PASS" "acceptable narrative-support wording present"
} else {
  Add-Result "X2 narrative support wording" "FAIL" "missing acceptable narrative-support wording"
}

Compare-Contains "H2 brief section" $newH2Reply "Brief Title"
Compare-Contains "H2 direct catalyst wording" $newH2Reply "Direct catalyst"
Compare-Contains "H2 narrative support wording" $newH2Reply "Narrative support"

Compare-Contains "X2 mixed no-direct wording" $newX2MixedReply "No direct"

if (
  ($newH2CrossReply -match "separate theaters") -or
  ($newH2CrossReply -match "distinct") -or
  ($newH2CrossReply -match "no direct evidence") -or
  ($newH2CrossReply -match "treat these as separate")
) {
  Add-Result "H2 cross restraint wording" "PASS" "restraint wording present"
} else {
  Add-Result "H2 cross restraint wording" "FAIL" "restraint wording missing"
}

Write-Host "== HX2 baseline diff summary ==" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$fails = @($results | Where-Object { $_.status -eq "FAIL" })
$warns = @($results | Where-Object { $_.status -eq "WARN" })

Write-Host ""
if ($fails.Count -gt 0) {
  Write-Host "HX2 BASELINE DIFF FAILED ($($fails.Count) fails, $($warns.Count) warnings)" -ForegroundColor Red
  exit 1
}

Write-Host "HX2 BASELINE DIFF PASSED ($($warns.Count) warnings)" -ForegroundColor Green
exit 0



