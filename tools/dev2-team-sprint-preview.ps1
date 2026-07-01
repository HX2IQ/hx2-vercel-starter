param(
  [string]$Objective = "Prepare the next HX2 team-mode sprint package.",
  [switch]$Json
)

$ErrorActionPreference = "Stop"

$ManifestFile = ".\tools\dev2-team-sprint-manifest.template.json"

if (-not (Test-Path $ManifestFile)) {
  throw "Missing team sprint manifest template: $ManifestFile"
}

$Manifest = Get-Content $ManifestFile -Raw | ConvertFrom-Json

$GitStatusRaw = @()
try {
  $GitStatusRaw = @(git status --short)
} catch {
  $GitStatusRaw = @("UNKNOWN git status unavailable")
}

function Get-ChangedPath {
  param([string]$Line)

  if ([string]::IsNullOrWhiteSpace($Line)) {
    return ""
  }

  $Trimmed = $Line.Trim()
  if ($Trimmed.Length -le 3) {
    return $Trimmed
  }

  return $Trimmed.Substring(3).Trim()
}

function Get-RiskClassForPath {
  param([string]$Path)

  $P = [string]$Path

  if ($P -match "^(app/api|prisma|middleware|next\.config|package\.json|app/api/hx2/_lib/unified-retrieval|app/api/hx2/chat-master)") {
    return "high"
  }

  if ($P -match "^(tools/hx2-quick-verify|tools/retrieval-quality|tools/dev2|tools/sprint-next|tools/orchestrator|tools/capability-planner)") {
    return "medium"
  }

  if ($P -match "(\.md$|closeout|README|docs|runbook)") {
    return "low"
  }

  return "medium"
}

function Get-VerifyTierForRisk {
  param([string]$Risk)

  switch ($Risk) {
    "high" { return "full + strict + benchmark + build if route/runtime changed" }
    "medium" { return "full + strict when retrieval/source/quick-verify related" }
    "low" { return "fast allowed for iteration; full before commit if package/guard changed" }
    default { return "full" }
  }
}

$ChangedPaths =
  @($GitStatusRaw | ForEach-Object { Get-ChangedPath -Line $_ }) |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

$ChangedRows =
  foreach ($Path in $ChangedPaths) {
    $Risk = Get-RiskClassForPath -Path $Path

    [pscustomobject]@{
      Path = $Path
      Risk = $Risk
      Verify = Get-VerifyTierForRisk -Risk $Risk
    }
  }

$Lanes =
  @($Manifest.lanes) |
    ForEach-Object {
      [pscustomobject]@{
        Lane = [string]$_.lane_id
        Role = [string]$_.role
        Risk = [string]$_.risk_class
        VerifyTier = [string]$_.verify_tier
        Ownership = [string]$_.ownership
      }
    }

$HotFiles =
  if ($Manifest.coordination -and $Manifest.coordination.hot_files) {
    @($Manifest.coordination.hot_files | ForEach-Object {
      [pscustomobject]@{
        Path = [string]$_.path
        OwnerLane = [string]$_.owner_lane
        Reason = [string]$_.reason
      }
    })
  } else {
    @()
  }

$MaxRisk =
  if (@($ChangedRows | Where-Object { $_.Risk -eq "high" }).Count -gt 0) {
    "high"
  } elseif (@($ChangedRows | Where-Object { $_.Risk -eq "medium" }).Count -gt 0) {
    "medium"
  } elseif (@($ChangedRows | Where-Object { $_.Risk -eq "low" }).Count -gt 0) {
    "low"
  } else {
    "none"
  }

$RecommendedVerify =
  switch ($MaxRisk) {
    "high" { "npm run hx2:quick:compact; npm run hx2:benchmark; npx tsc --noEmit --pretty false; npm run build when route/runtime affected" }
    "medium" { "npm run hx2:quick:compact; npm run hx2:benchmark" }
    "low" { "npm run hx2:quick:fast:compact for iteration; npm run hx2:quick:compact before commit" }
    default { "No changed files detected. Use team preview to plan next sprint." }
  }

$PreviewObject = [pscustomobject]@{
  mode = "dev2_team_sprint_preview"
  objective = $Objective
  phase_mode = [string]$Manifest.phase_mode
  sprint_template = [string]$Manifest.sprint_id
  lane_count = $Lanes.Count
  changed_file_count = $ChangedPaths.Count
  max_risk = $MaxRisk
  recommended_verify = $RecommendedVerify
  lanes = $Lanes
  changed_files = $ChangedRows
  hot_files = $HotFiles
}

if ($Json) {
  $PreviewObject | ConvertTo-Json -Depth 12
  exit 0
}

Write-Host ""
Write-Host "== DEV2 TEAM SPRINT PREVIEW =="
Write-Host "Objective: $Objective"
Write-Host "Mode: $($PreviewObject.phase_mode)"
Write-Host "Template: $($PreviewObject.sprint_template)"
Write-Host "Changed files: $($PreviewObject.changed_file_count)"
Write-Host "Max risk: $($PreviewObject.max_risk)"
Write-Host "Recommended verify: $($PreviewObject.recommended_verify)"

Write-Host ""
Write-Host "TEAM LANES"
$Lanes | Format-Table -AutoSize

Write-Host ""
Write-Host "HOT FILE COORDINATION"
$HotFiles | Format-Table -AutoSize

Write-Host ""
Write-Host "CHANGED FILE RISK MAP"
if ($ChangedRows.Count -gt 0) {
  $ChangedRows | Format-Table -AutoSize
} else {
  Write-Host "GREEN: working tree clean; no changed-file risk map needed."
}

Write-Host ""
Write-Host "NEXT TEAM-MODE SPRINT RULES"
Write-Host "- Architect defines boundaries first."
Write-Host "- Planner declares file ownership before patching."
Write-Host "- Implementer patches only owned files."
Write-Host "- QA runs the required verify tier."
Write-Host "- Release Manager commits/pushes only after expected files are staged."
Write-Host "- Docs lane closes the sprint after repo lock."

Write-Host ""
Write-Host "GREEN: DEV2 team sprint preview complete."

