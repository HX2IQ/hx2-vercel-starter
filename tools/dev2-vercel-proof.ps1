param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 VERCEL PROOF WORKFLOW =="

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ProofDir = "tools/_deployment-proof/$Stamp"
New-Item -ItemType Directory -Force -Path $ProofDir | Out-Null

$Head = (git rev-parse HEAD).Trim()
$Branch = (git branch --show-current).Trim()

@{
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  branch = $Branch
  head = $Head
  base_url = $BaseUrl
} | ConvertTo-Json -Depth 10 | Set-Content "$ProofDir/proof-context.json" -Encoding UTF8

git status --short | Set-Content "$ProofDir/git-status.txt" -Encoding UTF8
git log -8 --oneline | Set-Content "$ProofDir/git-log.txt" -Encoding UTF8

if (Test-Path ".vercel/project.json") {
  Copy-Item ".vercel/project.json" "$ProofDir/project.json"
}

if (Test-Path "vercel.json") {
  Copy-Item "vercel.json" "$ProofDir/vercel.json"
}

powershell -ExecutionPolicy Bypass -File ".\tools\dev2-topology-guard.ps1" | Tee-Object "$ProofDir/topology-guard.txt"

npx tsc --noEmit --pretty false | Tee-Object "$ProofDir/tsc.txt"

npm run build | Tee-Object "$ProofDir/npm-build.txt"

powershell -ExecutionPolicy Bypass -File ".\tools\dev2-route-contract-guard.ps1" -BaseUrl $BaseUrl | Tee-Object "$ProofDir/route-contract.txt"

Write-Host "Proof written to: $ProofDir"
Write-Host "DEV2 VERCEL PROOF WORKFLOW PASSED"
