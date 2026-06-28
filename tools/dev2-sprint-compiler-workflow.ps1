param(
  [switch]$SkipTypeScript,
  [switch]$SkipVerifyDecision
)

$ErrorActionPreference = "Stop"

Write-Host "`n== DEV2 SPRINT COMPILER WORKFLOW =="
Write-Host "Purpose: faster roadmap feature selection + compiler confidence before patching."
Write-Host "Secrets printed: false"

Write-Host "`n== GIT STATE =="
$Status = git status --short
if ($Status) {
  $Status
  Write-Host "YELLOW: working tree has changes; workflow will still run for in-progress sprint validation."
} else {
  Write-Host "GREEN: working tree clean"
}

Write-Host "`n== NEXT STRATEGIST =="
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\hx2-next.ps1

Write-Host "`n== FEATURE PACK INDEX =="
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\dev2-feature-pack-index.ps1
if ($LASTEXITCODE -ne 0) { throw "Feature pack index failed." }

if (-not $SkipTypeScript) {
  Write-Host "`n== TYPESCRIPT COMPILER GATE =="
  npx tsc --noEmit --pretty false
  if ($LASTEXITCODE -ne 0) { throw "TypeScript compiler gate failed." }
} else {
  Write-Host "`nSKIP: TypeScript compiler gate"
}

if (-not $SkipVerifyDecision) {
  Write-Host "`n== VERIFY DECISION DRY RUN =="
  npm run hx2:verify:auto:dry
  if ($LASTEXITCODE -ne 0) { throw "Verify decision dry run failed." }
} else {
  Write-Host "`nSKIP: Verify decision dry run"
}

Write-Host "`n== NEXT BUILD COMMANDS =="
Write-Host "Run a feature pack:     npm run dev2:feature -- <pack-name>"
Write-Host "Compile/check sprint:   npm run dev2:sprint:compiler"
Write-Host "Legacy executor:        npm run hx2:exec"
Write-Host "Full confidence gate:   npm run hx2:verify:auto"
Write-Host "Benchmark gate:         npm run hx2:benchmark"

Write-Host "`nGREEN: DEV2 sprint compiler workflow complete."
