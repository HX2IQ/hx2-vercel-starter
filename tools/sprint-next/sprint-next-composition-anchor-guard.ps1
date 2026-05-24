$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== SPRINT NEXT COMPOSITION ANCHOR GUARD =="

$file = "app/api/hx2/_lib/sprint-next-composition.ts"

if (!(Test-Path $file)) {
  throw "Missing sprint-next-composition.ts"
}

$text = Get-Content $file -Raw

$anchors = @(
  "const baseDecision =",
  "operator_decision =",
  "operator_followthrough =",
  "execution_memory =",
  "dev2_sprint_package:"
)

$missing = @()

foreach ($anchor in $anchors) {

  $count =
    ([regex]::Matches(
      $text,
      [regex]::Escape($anchor)
    )).Count

  if ($count -ne 1) {
    $missing += "$anchor expected exactly once, found $count"
  }
}

if ($missing.Count -gt 0) {

  foreach ($m in $missing) {
    Write-Host "- $m"
  }

  throw "Sprint Next composition anchor guard failed"
}

Write-Host "SPRINT NEXT COMPOSITION ANCHOR GUARD PASSED"
