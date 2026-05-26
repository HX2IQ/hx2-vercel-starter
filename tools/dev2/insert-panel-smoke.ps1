$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 PANEL INSERTER SMOKE TEST =="

$dir = "tools/dev2/tmp-panel-inserter-smoke"
New-Item -ItemType Directory -Force $dir | Out-Null

$target = Join-Path $dir "target.txt"
$insert = Join-Path $dir "insert.txt"

$targetLines = @(
  "export function TestPanel() {"
  "  return ("
  "    <div>"
  "      ANCHOR_PANEL"
  "    </div>"
  "  );"
  "}"
)
$targetLines | Set-Content $target

$insertLines = @(
  ""
  "      <InsertedPanel />"
  ""
)
$insertLines | Set-Content $insert

powershell -ExecutionPolicy Bypass -File tools/dev2/insert-panel.ps1 -TargetFile $target -Anchor "ANCHOR_PANEL" -InsertFile $insert -Mode before

$text = Get-Content $target -Raw

if ($text -notlike "*<InsertedPanel />*") {
  throw "Panel insertion smoke failed"
}

Write-Host "DEV2 PANEL INSERTER SMOKE TEST PASSED"

Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Temporary smoke fixtures cleaned."


