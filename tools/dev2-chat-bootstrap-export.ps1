$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 CHAT BOOTSTRAP EXPORT =="

$Head = (git rev-parse HEAD).Trim()
$Branch = (git branch --show-current).Trim()
$Remote = (git remote get-url origin).Trim()

$ProjectJson = Get-Content ".vercel/project.json" -Raw | ConvertFrom-Json

$Bootstrap = @"
# HX2 CHAT BOOTSTRAP

Generated UTC:
$((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"))

Repo:
$Remote

Branch:
$Branch

HEAD:
$Head

Vercel project:
$($ProjectJson.projectName)

Vercel rootDirectory:
$($ProjectJson.settings.rootDirectory)

Production domain:
https://optinodeiq.com

Current phase:
Phase 3B stabilization / deployment continuity hardening

Canonical route tree:
app/api

Do not use:
src/app/api

Current verified runtime intelligence routes:
- /api/hx2/runtime-intelligence-dependency-validation
- /api/hx2/runtime-intelligence-graph-integrity-summary
- /api/hx2/runtime-intelligence-execution-readiness

Critical DEV2 lesson:
PowerShell URLs must use `${Route}` before query strings. Do not use `$Route?cb`.

DEV2 rules:
- Use Structured Mutation Mode
- Prefer inspect -> coherent rewrite -> tsc -> guard -> sprint
- Avoid nested powershell -Command
- Avoid fragile anchor-only patches
- Verify live route contracts before feature sprints

Recommended first command in new chat:
powershell -ExecutionPolicy Bypass -File .\tools\dev2-topology-guard.ps1
powershell -ExecutionPolicy Bypass -File .\tools\dev2-route-contract-guard.ps1 -BaseUrl "https://optinodeiq.com"
"@

Set-Content "HX2_CHAT_BOOTSTRAP.md" $Bootstrap -Encoding UTF8

Write-Host "HX2_CHAT_BOOTSTRAP.md written."
