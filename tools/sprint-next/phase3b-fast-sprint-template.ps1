param(
  [string]$FeatureName = "phase-3b-next-feature",
  [string]$Message = "Phase 3B sprint update",
  [switch]$LocalOnly
)

$ErrorActionPreference = "Stop"

if ($LocalOnly) {
  powershell -ExecutionPolicy Bypass -File ".\tools\sprint-next\phase3b-fast-safe-sprint.ps1" `
    -FeatureName $FeatureName `
    -LocalOnly
  exit 0
}

powershell -ExecutionPolicy Bypass -File ".\tools\sprint-next\phase3b-fast-safe-sprint.ps1" `
  -FeatureName $FeatureName `
  -Message $Message
