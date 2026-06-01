$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 CHAT RECOVERY EXPORT =="

$OutFile = "HX2_CHAT_RECOVERY_PROMPT.md"

$GitBranch = git branch --show-current
$GitSha = git rev-parse HEAD

$Routes = Get-ChildItem ".\app\api\hx2" -Directory |
  Select-Object -ExpandProperty Name |
  Sort-Object

$Text = @"
# HX2 DEV2 CHAT RECOVERY PROMPT

## Repository
HX2IQ/hx2-vercel-starter

## Branch
$GitBranch

## HEAD
$GitSha

## Critical DEV2 Commands

npm run dev2:continuity
npm run dev2:precheck
npm run dev2:postdeploy

## Deployment Truth

- Production domain: https://optinodeiq.com
- Vercel project: optinodeiq
- App Router APIs located under: app/api/*
- NOT src/app/api/*
- Runtime intelligence routes verified LIVE
- DEV2 continuity system installed
- Topology guards installed
- Route diff system installed
- Bootstrap continuity system installed

## Critical Runtime Routes
"@

foreach ($Route in $Routes) {
  $Text += "`n- /api/hx2/$Route"
}

$Text += @"

## Recovery Procedure

1. Run:
   npm run dev2:continuity

2. Verify:
   npm run dev2:precheck

3. Verify production:
   npm run dev2:postdeploy

4. Never trust conversational memory alone.
5. Always trust:
   - git SHA
   - live route probes
   - topology guards
   - route diff verification
   - deployment proof system

## Known Historical Failure

A false deployment failure occurred because PowerShell interpolated:

/api/hx2/$Route?cb=

incorrectly.

Correct safe syntax:

/api/hx2/${Route}?cb=

The routes themselves were healthy.
The deployments themselves were healthy.
The probe tooling was malformed.

This is now permanently hardened in DEV2.
"@

Set-Content $OutFile $Text -Encoding UTF8

Write-Host ""
Write-Host "Recovery prompt written:"
Write-Host $OutFile
