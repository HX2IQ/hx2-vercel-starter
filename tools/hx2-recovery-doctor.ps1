param(
  [int]$MaxBackupAgeHours = 36
)

$ErrorActionPreference = "Stop"

Write-Host "`n== HX2 RECOVERY DOCTOR =="
Write-Host "Secrets printed: false"

Write-Host "`n== REQUIRED TOOL CHECK =="
$RequiredFiles = @(
  "tools\hx2-db-inventory.ps1",
  "tools\hx2-db-backup.ps1",
  "tools\hx2-db-restore-test.ps1",
  "tools\hx2-db-install-scheduled-backup.ps1",
  "tools\hx2-db-scheduled-backup-status.ps1",
  "tools\hx2-db-backup-health.ps1",
  "tools\hx2-recovery-snapshot.ps1"
)

foreach ($File in $RequiredFiles) {
  if (-not (Test-Path $File)) {
    throw "Missing recovery tool: $File"
  }
  Write-Host "GREEN: $File"
}

Write-Host "`n== PACKAGE SCRIPT CHECK =="
$Package = Get-Content .\package.json -Raw | ConvertFrom-Json
$RequiredScripts = @(
  "hx2:db:inventory",
  "hx2:db:backup",
  "hx2:db:restore-test",
  "hx2:db:schedule",
  "hx2:db:schedule:status",
  "hx2:db:health",
  "hx2:recovery:snapshot"
)

foreach ($ScriptName in $RequiredScripts) {
  if (-not $Package.scripts.$ScriptName) {
    throw "Missing package script: $ScriptName"
  }
  Write-Host "GREEN: $ScriptName"
}

Write-Host "`n== DB INVENTORY =="
npm run hx2:db:inventory
if ($LASTEXITCODE -ne 0) { throw "DB inventory failed." }

Write-Host "`n== BACKUP HEALTH =="
npm run hx2:db:health -- -MaxAgeHours $MaxBackupAgeHours
if ($LASTEXITCODE -ne 0) { throw "Backup health failed." }

Write-Host "`n== SCHEDULED BACKUP STATUS =="
npm run hx2:db:schedule:status
if ($LASTEXITCODE -ne 0) { throw "Scheduled backup status failed." }

Write-Host "`n== LATEST PORTABLE BACKUPS =="
Get-ChildItem "C:\HX2-Backups\databases" -Filter "hx2-db-public-*.dump" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 5 FullName, Length, LastWriteTime |
  Format-Table -AutoSize

Write-Host "`n== GIT STATE =="
git status --short

Write-Host "`nGREEN: HX2 recovery doctor passed."
