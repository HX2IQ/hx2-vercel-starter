$ErrorActionPreference = "Stop"

Write-Host "`n== DEV2 FEATURE PACK INDEX =="

$Root = ".\tools\feature-packs"

if (-not (Test-Path $Root)) {
  Write-Host "No feature-pack directory found."
  exit 0
}

$Rows = @()

Get-ChildItem $Root -Directory | Sort-Object Name | ForEach-Object {
  $Dir = $_.FullName
  $Name = $_.Name
  $FeatureJson = Join-Path $Dir "feature.json"
  $Readme = Join-Path $Dir "README.md"
  $PatchPlan = Join-Path $Dir "patch-plan.md"

  $Status = "GREEN"
  $Notes = @()

  if (-not (Test-Path $FeatureJson)) {
    $Status = "RED"
    $Notes += "missing feature.json"
  }

  if (-not (Test-Path $Readme)) {
    $Status = "YELLOW"
    $Notes += "missing README.md"
  }

  if (-not (Test-Path $PatchPlan)) {
    $Status = "YELLOW"
    $Notes += "missing patch-plan.md"
  }

  $Title = $Name
  $Description = ""

  if (Test-Path $FeatureJson) {
    try {
      $Feature = Get-Content $FeatureJson -Raw | ConvertFrom-Json
      if ($Feature.name) { $Title = [string]$Feature.name }
      if ($Feature.description) { $Description = [string]$Feature.description }
    } catch {
      $Status = "RED"
      $Notes += "invalid feature.json"
    }
  }

  $Rows += [pscustomobject]@{
    Pack = $Name
    Status = $Status
    Title = $Title
    Description = $Description
    Command = "npm run dev2:feature -- $Name"
    Notes = ($Notes -join "; ")
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

if ($Red -gt 0) {
  throw "Feature pack index has RED rows."
}

Write-Host "`nGREEN: DEV2 feature pack index complete."
