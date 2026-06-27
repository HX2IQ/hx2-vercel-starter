$ErrorActionPreference = "Stop"

Write-Host "`n== HX2 PHASE 13 RETAIL CHAT CLOSEOUT REPORT =="
Write-Host "Secrets printed: false"

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$OutRoot = "tools\_phase-closeouts"
New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null

$ReportFile = Join-Path $OutRoot "phase13-retail-chat-closeout-$Stamp.txt"

function Add-ReportLine {
  param([string]$Line)
  Add-Content -Path $ReportFile -Value $Line
  Write-Host $Line
}

Add-ReportLine "HX2 PHASE 13 RETAIL CHAT CLOSEOUT"
Add-ReportLine ""
Add-ReportLine "CreatedAt: $((Get-Date).ToString('o'))"
Add-ReportLine "Repo: $(Get-Location)"
Add-ReportLine "GitHead: $(git rev-parse HEAD)"
Add-ReportLine "SecretsIncluded: false"
Add-ReportLine ""

Add-ReportLine "PHASE 13 LOCKED SURFACES"
Add-ReportLine "- Main /chat user-flow"
Add-ReportLine "- Main chat UI adapter wiring"
Add-ReportLine "- Embedded HealthOI chat adapter wiring"
Add-ReportLine "- Retail chat negative/error-state handling"
Add-ReportLine "- Browser-proof prep surfaces"
Add-ReportLine "- Direct endpoint cleanup report"
Add-ReportLine "- Direct endpoint allowlist guard"
Add-ReportLine "- Live chat E2E safe preview"
Add-ReportLine "- Answer quality and participation smoke"
Add-ReportLine "- Auto verify posture"
Add-ReportLine ""

Add-ReportLine "STANDARD VERIFY COMMANDS"
Add-ReportLine "npm run hx2:retail-chat:verify"
Add-ReportLine "npm run hx2:retail-chat:verify:local"
Add-ReportLine "npm run hx2:verify:policy"
Add-ReportLine "npm run hx2:recovery:doctor"
Add-ReportLine ""

Add-ReportLine "CURRENT PACKAGE SCRIPT CHECK"
$Package = Get-Content .\package.json -Raw | ConvertFrom-Json

$RequiredScripts = @(
  "hx2:retail-chat:verify",
  "hx2:retail-chat:verify:local",
  "hx2:retail-chat:verify:strict",
  "hx2:verify:auto",
  "hx2:verify:policy",
  "hx2:recovery:doctor"
)

foreach ($ScriptName in $RequiredScripts) {
  if ($Package.scripts.$ScriptName) {
    Add-ReportLine "GREEN: $ScriptName"
  } else {
    Add-ReportLine "RED: missing $ScriptName"
    throw "Missing required closeout script: $ScriptName"
  }
}

Add-ReportLine ""
Add-ReportLine "GREEN: Phase 13 retail chat closeout report generated."
Add-ReportLine "ReportFile: $ReportFile"
