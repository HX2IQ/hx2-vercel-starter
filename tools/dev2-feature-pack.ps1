param(
  [Parameter(Mandatory=$true)]
  [string]$Name,

  [string]$FeatureType = "hx2",
  [string]$Smoke = "manual",
  [string]$Commit = ""
)

$ErrorActionPreference = "Stop"

$Slug = ($Name.ToLower() -replace '[^a-z0-9]+','-' -replace '(^-|-$)','')
$Dir = "tools\feature-packs\$Slug"
New-Item -ItemType Directory -Force -Path $Dir | Out-Null

$CommitMessage = if ($Commit) { $Commit } else { "Add $Name" }

$Spec = @{
  name = $Name
  slug = $Slug
  type = $FeatureType
  created_at = (Get-Date).ToString("s")
  smoke = $Smoke
  commit_message = $CommitMessage
  checklist = @(
    "Define feature purpose",
    "List files touched",
    "Create backup/snapshot",
    "Apply patch",
    "Run build",
    "Run smoke",
    "Deploy only if green",
    "Commit clean feature"
  )
}

$Spec | ConvertTo-Json -Depth 10 | Set-Content "$Dir\feature.json" -Encoding UTF8

@"
# DEV2 Feature Pack: $Name

## Purpose
TODO: Define the feature purpose.

## Files touched
TODO: List files.

## Patch plan
TODO: Add exact PowerShell patch steps.

## Smoke test
$Smoke

## Commit
$CommitMessage

## Status
Draft
"@ | Set-Content "$Dir\README.md" -Encoding UTF8

Write-Host ""
Write-Host "DEV2 feature pack created:" -ForegroundColor Green
Write-Host $Dir
