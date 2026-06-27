param(
  [string]$SnapshotRoot = "C:\HX2-Backups\recovery-packets"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $SnapshotRoot | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$PacketDir = Join-Path $SnapshotRoot "hx2-recovery-packet-$Stamp"
New-Item -ItemType Directory -Force -Path $PacketDir | Out-Null

Write-Host "`n== HX2 RECOVERY SNAPSHOT =="
Write-Host "Packet: $PacketDir"
Write-Host "Secrets included: false"

Write-Host "`n== GIT STATE =="
git status --short | Tee-Object -FilePath (Join-Path $PacketDir "git-status.txt")
git rev-parse HEAD | Tee-Object -FilePath (Join-Path $PacketDir "git-head.txt")
git remote -v | Tee-Object -FilePath (Join-Path $PacketDir "git-remotes.txt")
git log -5 --oneline | Tee-Object -FilePath (Join-Path $PacketDir "git-log-last-5.txt")

Write-Host "`n== PACKAGE SCRIPTS SNAPSHOT =="
node -e "const p=require('./package.json'); for (const [k,v] of Object.entries(p.scripts||{})) console.log(k+' = '+v)" |
  Tee-Object -FilePath (Join-Path $PacketDir "package-scripts.txt")

Write-Host "`n== LOCAL ENV KEY INVENTORY ONLY =="
$EnvOut = Join-Path $PacketDir "local-env-keys-only.txt"
Get-ChildItem -Force -File .env* -ErrorAction SilentlyContinue |
  ForEach-Object {
    Add-Content -Path $EnvOut -Value ""
    Add-Content -Path $EnvOut -Value "FILE: $($_.Name)"
    Get-Content $_.FullName |
      Where-Object { $_ -match "=" } |
      ForEach-Object {
        $Key = ($_ -split "=", 2)[0]
        Add-Content -Path $EnvOut -Value "$Key=<configured>"
      }
  }
Get-Content $EnvOut -ErrorAction SilentlyContinue

Write-Host "`n== VERCEL ENV KEY INVENTORY =="
foreach ($EnvName in @("production", "preview", "development")) {
  $OutFile = Join-Path $PacketDir "vercel-env-$EnvName.txt"
  npx vercel@latest env ls $EnvName | Tee-Object -FilePath $OutFile
}

Write-Host "`n== DB INVENTORY =="
npm run hx2:db:inventory | Tee-Object -FilePath (Join-Path $PacketDir "db-inventory.txt")
if ($LASTEXITCODE -ne 0) { throw "DB inventory failed during recovery snapshot." }

Write-Host "`n== DB BACKUP HEALTH =="
npm run hx2:db:health | Tee-Object -FilePath (Join-Path $PacketDir "db-backup-health.txt")
if ($LASTEXITCODE -ne 0) { throw "DB backup health failed during recovery snapshot." }

Write-Host "`n== SCHEDULED BACKUP STATUS =="
npm run hx2:db:schedule:status | Tee-Object -FilePath (Join-Path $PacketDir "scheduled-backup-status.txt")
if ($LASTEXITCODE -ne 0) { throw "Scheduled backup status failed during recovery snapshot." }

Write-Host "`n== LATEST BACKUPS =="
Get-ChildItem "C:\HX2-Backups\databases" -Filter "*.dump" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10 FullName, Length, LastWriteTime |
  Tee-Object -FilePath (Join-Path $PacketDir "latest-db-backups.txt") |
  Format-Table -AutoSize

$SummaryFile = Join-Path $PacketDir "HX2-RECOVERY-SNAPSHOT-SUMMARY.txt"

@(
  "HX2 RECOVERY SNAPSHOT",
  "",
  "CreatedAt: $((Get-Date).ToString('o'))",
  "RepoPath: $(Get-Location)",
  "PacketDir: $PacketDir",
  "SecretsIncluded: false",
  "",
  "Use this packet to identify:",
  "- Current Git commit",
  "- Current Vercel env keys, without values",
  "- Current DB host/database/user, without password",
  "- Latest database backup files",
  "- Scheduled backup status",
  "- Backup health result",
  "",
  "Critical local backup roots:",
  "C:\HX2-Backups\databases",
  "C:\HX2-Backups\manifests",
  "C:\HX2-Backups\restore-tests",
  "C:\HX2-Backups\recovery-packets"
) | Set-Content -Path $SummaryFile -Encoding UTF8

Write-Host "`nGREEN: HX2 recovery snapshot complete."
Write-Host "Summary: $SummaryFile"
