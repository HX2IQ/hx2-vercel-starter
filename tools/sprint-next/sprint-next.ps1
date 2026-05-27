param(
  [string]$FeatureName = "phase-3b-sprint-next",
  [string]$Message = "Phase 3B sprint next",
  [string]$ProbeUrl = "https://optinodeiq.com",
  [switch]$LocalOnly,
  [switch]$DryRun,
  [switch]$AllowNoCommit,
  [switch]$SkipDiffSummary
)

$ErrorActionPreference = "Stop"

$ArgsList = @(
  "-ExecutionPolicy", "Bypass",
  "-File", ".\tools\sprint-next\phase3b-fast-safe-sprint.ps1",
  "-FeatureName", $FeatureName,
  "-Message", $Message,
  "-ProbeUrl", $ProbeUrl
)

if ($LocalOnly) { $ArgsList += "-LocalOnly" }
if ($DryRun) { $ArgsList += "-DryRun" }
if ($AllowNoCommit) { $ArgsList += "-AllowNoCommit" }
if ($SkipDiffSummary) { $ArgsList += "-SkipDiffSummary" }

powershell @ArgsList

