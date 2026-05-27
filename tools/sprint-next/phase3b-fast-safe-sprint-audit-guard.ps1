$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B FAST SAFE SPRINT AUDIT GUARD =="

$FastPath = "tools/sprint-next/phase3b-fast-safe-sprint.ps1"

if (!(Test-Path $FastPath)) {
  throw "Missing fast safe sprint runner: $FastPath"
}

$Script = Get-Content $FastPath -Raw

$RequiredTerms = @(
  "tools/sprint-next/_audit",
  "audit_id",
  "started_at_utc",
  "completed_at_utc",
  "before_commit",
  "after_commit",
  "result = `"passed`"",
  "Audit written"
)

foreach ($Term in $RequiredTerms) {
  if ($Script -notmatch [regex]::Escape($Term)) {
    throw "Fast safe sprint audit missing required term: $Term"
  }
}

Write-Host "PHASE 3B FAST SAFE SPRINT AUDIT GUARD PASSED"
