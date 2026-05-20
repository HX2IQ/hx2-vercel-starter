$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 SCRATCH WORKSPACE GUARD =="

$tsconfig = "tsconfig.json"
$readme = "tools/dev2/scratch/README.md"

foreach ($path in @($tsconfig, $readme)) {
  if (!(Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$ts = Get-Content $tsconfig -Raw
$md = Get-Content $readme -Raw

$requiredTs = @(
  "tools/dev2/scratch"
)

$requiredReadme = @(
  "DEV2 Scratch Workspace",
  "temporary smoke fixtures",
  "excluded from TypeScript compile safety scope"
)

$missing = @()

foreach ($needle in $requiredTs) {
  if ($ts -notlike "*$needle*") {
    $missing += "Missing in tsconfig: $needle"
  }
}

foreach ($needle in $requiredReadme) {
  if ($md -notlike "*$needle*") {
    $missing += "Missing in scratch README: $needle"
  }
}

if ($missing.Count -gt 0) {
  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "DEV2 scratch workspace guard failed"
}

Write-Host "DEV2 SCRATCH WORKSPACE GUARD PASSED"
