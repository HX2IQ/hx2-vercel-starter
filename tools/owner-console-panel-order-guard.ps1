$ErrorActionPreference = "Stop"

$Page = ".\app\owner-console\page.tsx"

if (!(Test-Path $Page)) {
  throw "Owner console page missing: $Page"
}

$text = Get-Content $Page -Raw

$expectedOrder = @(
  "<ControlHubPanel",
  "<SystemSnapshotHeader",
  "<BenchmarkStatusPanel",
  "<GuardStatusPanel",
  "<EnvironmentStatusPanel",
  "<MemoryStatusPanel",
  "<ChatMasterHealthPanel",
  "<Ap2QueuePanel",
  "<ActiveNodesPanel"
)

$lastIndex = -1
$failures = @()

foreach ($marker in $expectedOrder) {
  $idx = $text.IndexOf($marker)

  if ($idx -lt 0) {
    $failures += "Missing panel marker: $marker"
    continue
  }

  if ($idx -lt $lastIndex) {
    $failures += "Panel out of order: $marker"
  }

  $lastIndex = $idx
}

if ($failures.Count -gt 0) {
  Write-Host "OWNER CONSOLE PANEL ORDER GUARD FAILED" -ForegroundColor Red
  $failures | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
  throw "Owner console panel order invalid"
}

Write-Host "OWNER CONSOLE PANEL ORDER GUARD PASSED" -ForegroundColor Green
