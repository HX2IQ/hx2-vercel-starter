param(
  [string]$BaselineRoot = ".\tools\baselines",
  [string]$OutDir = ".\tools\release-notes"
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
  $_.Name -ne "_incomplete" -and (Test-BaselineComplete $_.FullName)
}

if ($dirs.Count -lt 2) {
  throw "Need at least 2 complete baseline folders to generate release notes"
}

$oldDir = $dirs[$dirs.Count - 2].FullName
$newDir = $dirs[$dirs.Count - 1].FullName

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

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

function Add-Line {
  param(
    [System.Collections.Generic.List[string]]$Lines,
    [string]$Text
  )
  $Lines.Add($Text) | Out-Null
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

$notes = New-Object 'System.Collections.Generic.List[string]'
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Add-Line $notes "# HX2 Release Notes"
Add-Line $notes ""
Add-Line $notes "- Generated: $stamp"
Add-Line $notes "- Previous baseline: $([IO.Path]::GetFileName($oldDir))"
Add-Line $notes "- Current baseline: $([IO.Path]::GetFileName($newDir))"
Add-Line $notes ""
Add-Line $notes "## Summary"
Add-Line $notes ""
Add-Line $notes "- X2 anchor source: $($newX2.anchor_source)"
Add-Line $notes "- H2 anchor source: $($newH2.anchor_source)"
Add-Line $notes "- X2 direct catalysts: $($newX2.catalyst_summary.direct_catalysts.Count)"
Add-Line $notes "- H2 direct catalysts: $($newH2.catalyst_summary.direct_catalysts.Count)"
Add-Line $notes "- X2 contains indirect-backdrop style wording: $((($newX2Reply -match 'Indirect backdrop') -or ($newX2Reply -match 'risk appetite') -or ($newX2Reply -match 'macro environment')))"
Add-Line $notes "- H2 contains direct-catalyst wording: $($newH2Reply -match 'Direct catalyst')"
Add-Line $notes "- H2 cross-theater restraint preserved: $((($newH2CrossReply -match 'separate theaters') -or ($newH2CrossReply -match 'distinct') -or ($newH2CrossReply -match 'no direct evidence') -or ($newH2CrossReply -match 'treat these as separate')))"
Add-Line $notes ""

$outFile = Join-Path $OutDir ("release-note-" + ([IO.Path]::GetFileName($newDir)) + ".md")
$notes -join "`r`n" | Set-Content $outFile -Encoding UTF8

Write-Host "Release note created: $outFile" -ForegroundColor Green

