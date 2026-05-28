$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== PHASE 3B PRODUCTION AUDIT SUMMARY GUARD =="

$VerifyPath = "tools/sprint-next/phase3b-master-production-verify.ps1"

if (!(Test-Path $VerifyPath)) {
  throw "Missing master production verify script: $VerifyPath"
}

$Verify = Get-Content $VerifyPath -Raw

$RequiredTerms = @(
  "_audit",
  "audit_id",
  "probe_count",
  "completed_at_utc",
  "ConvertTo-Json",
  "phase3b-master-production-verify"
)

foreach ($Term in $RequiredTerms) {
  if (-not $Verify.Contains($Term)) {
    throw "Master production verify missing audit summary term: $Term"
  }
}

Write-Host "PHASE 3B PRODUCTION AUDIT SUMMARY GUARD PASSED"
