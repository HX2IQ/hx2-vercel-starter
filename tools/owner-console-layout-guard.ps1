$ErrorActionPreference = "Stop"

$Page = ".\app\owner-console\page.tsx"

if (!(Test-Path $Page)) {
  throw "Owner console page missing: $Page"
}

$text = Get-Content $Page -Raw

$panels = @(
  "ControlHubPanel",
  "SystemSnapshotHeader",
  "BenchmarkStatusPanel",
  "MemoryStatusPanel",
  "ChatMasterHealthPanel",
  "Ap2QueuePanel",
  "ActiveNodesPanel",
  "SystemHealthSummaryPanel"
)

$failures = @()

foreach ($panel in $panels) {
  $pattern = "<$panel"
  $count = ([regex]::Matches($text, [regex]::Escape($pattern))).Count

  if ($count -gt 1) {
    $failures += "$panel duplicated $count times"
  }
}

if ($failures.Count -gt 0) {
  Write-Host "OWNER CONSOLE LAYOUT GUARD FAILED"
  $failures | ForEach-Object { Write-Host "- $_" }
  throw "Duplicate owner-console panels detected"
}

Write-Host "OWNER CONSOLE LAYOUT GUARD PASSED"
