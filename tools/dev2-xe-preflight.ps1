param(
  [switch]$Strict,
  [ValidateSet("all", "status", "routes", "tools", "scripts", "master", "verify")]
  [string]$InspectFocus = "verify"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE PREFLIGHT BUNDLE =="
Write-Host "Strict: $Strict"
Write-Host "InspectFocus: $InspectFocus"
Write-Host "Mode: safety preflight"
Write-Host "Secrets printed: false"

Write-Host ""
Write-Host "== DEV2-XE POLICY GUARD =="
npm run dev2:xe:policy
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE policy guard failed." }

Write-Host ""
Write-Host "== DEV2-XE SAFE INSPECT =="
npm run dev2:xe:inspect -- -Focus $InspectFocus
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE safe inspect failed." }

Write-Host ""
Write-Host "== DEV2-XE DIFF APPROVAL GATE =="
if ($Strict) {
  npm run dev2:xe:diff-gate -- -Strict
} else {
  npm run dev2:xe:diff-gate
}
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE diff approval gate failed." }

Write-Host ""
Write-Host "== DEV2-XE NO AUTO-RELEASE GUARD =="
npm run dev2:xe:no-auto-release
if ($LASTEXITCODE -ne 0) { throw "DEV2-XE no auto-release guard failed." }

Write-Host ""
Write-Host "== HX2 VERIFY POLICY =="
npm run hx2:verify:policy
if ($LASTEXITCODE -ne 0) { throw "HX2 verify policy failed." }

Write-Host ""
Write-Host "== DEV2-XE PREFLIGHT SUMMARY =="
[pscustomobject]@{
  Policy = "GREEN"
  Inspect = "GREEN"
  DiffGate = "GREEN"
  NoAutoRelease = "GREEN"
  VerifyPolicy = "GREEN"
  Strict = [bool]$Strict
  Meaning = "DEV2-XE is cleared for safe planning/inspection work. Runtime patches still require their normal typecheck/build/smoke/verify gates."
} | Format-List

Write-Host "GREEN: DEV2-XE preflight bundle passed."

