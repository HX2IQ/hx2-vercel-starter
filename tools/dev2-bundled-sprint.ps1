$ErrorActionPreference = "Stop"

param(
  [string[]]$Packs = @(),
  [switch]$AllGreen
  [switch]$SkipRetailVerify
  [switch]$SkipBenchmark
  [switch]$NoCommit
  [string]$CommitMessage = "Apply DEV2 bundled sprint" )

Write-Host ""
Write-Host "== DEV2 BUNDLED SPRINT RUNNER =="
Write-Host "Purpose: apply multiple safe feature packs, then validate once."
Write-Host "Secrets printed: false"

$InitialStatus = git status --short
if ($InitialStatus) {
  Write-Host ""
  Write-Host "RED: working tree not clean. Commit or clean before bundled sprint."
  git status --short
  exit 1
}

if (-not (Test-Path ".\tools\feature-packs")) {
  throw "Missing tools\feature-packs folder."
}

if ($AllGreen) {
  $Packs = Get-ChildItem ".\tools\feature-packs" -Directory | ForEach-Object { $_.Name }
}

if (-not $Packs -or $Packs.Count -eq 0) {
  Write-Host ""
  Write-Host "No packs supplied. Usage:"
  Write-Host "npm run dev2:bundle -- -Packs pack-a,pack-b"
  Write-Host "npm run dev2:bundle:all-green"
  exit 1
}

Write-Host ""
Write-Host "== PACKS TO APPLY =="
$Packs | ForEach-Object { Write-Host "- $_" }

foreach ($Pack in $Packs) {
  $PackPath = Join-Path ".\tools\feature-packs" $Pack
  if (-not (Test-Path $PackPath)) {
    throw "Feature pack not found: $Pack"
  }

  Write-Host ""
  Write-Host "== APPLY FEATURE PACK: $Pack =="
  npm run dev2:feature -- $Pack
  if ($LASTEXITCODE -ne 0) {
    throw "Feature pack failed: $Pack"
  }
}

Write-Host ""
Write-Host "== STATUS AFTER PACKS =="
git status --short

Write-Host ""
Write-Host "== DEV2 COMPILER WORKFLOW =="
npm run hx2:exec
if ($LASTEXITCODE -ne 0) { throw "HX2 exec failed." }

Write-Host ""
Write-Host "== TYPE CHECK =="
npx tsc --noEmit --pretty false
if ($LASTEXITCODE -ne 0) { throw "TypeScript failed." }

if (-not $SkipBenchmark) {
  Write-Host ""
  Write-Host "== BENCHMARK =="
  npm run hx2:benchmark
  if ($LASTEXITCODE -ne 0) { throw "Benchmark failed." }
}

if (-not $SkipRetailVerify) {
  Write-Host ""
  Write-Host "== RETAIL CHAT VERIFY =="
  npm run hx2:retail-chat:verify
  if ($LASTEXITCODE -ne 0) { throw "Retail chat verify failed." }
}

Write-Host ""
Write-Host "== VERIFY POLICY =="
npm run hx2:verify:policy
if ($LASTEXITCODE -ne 0) { throw "Verify policy failed." }

if ($NoCommit) {
  Write-Host ""
  Write-Host "GREEN: bundled sprint validated. No commit requested."
  exit 0
}

Write-Host ""
Write-Host "== STAGE BUNDLED SPRINT CHANGES =="
git add .

Write-Host ""
Write-Host "== STAGED FILES =="
git diff --cached --name-status

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "No staged changes to commit."
} else {
  Write-Host ""
  Write-Host "== COMMIT =="
  git commit -m $CommitMessage
  if ($LASTEXITCODE -ne 0) { throw "Commit failed." }

  Write-Host ""
  Write-Host "== PUSH =="
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw "Push failed." }
}

Write-Host ""
Write-Host "== FINAL STATUS =="
git status --short

Write-Host ""
Write-Host "GREEN: DEV2 bundled sprint complete."
