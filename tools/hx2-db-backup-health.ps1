param(
  [string]$BackupRoot = "C:\HX2-Backups\databases",
  [int]$MaxAgeHours = 36
)

$ErrorActionPreference = "Stop"

function Get-Hx2FileSha256 {
  param([string]$Path)

  if (Get-Command Get-FileHash -ErrorAction SilentlyContinue) {
    return (Get-FileHash $Path -Algorithm SHA256).Hash
  }

  $Stream = [System.IO.File]::OpenRead($Path)
  try {
    $Sha = [System.Security.Cryptography.SHA256]::Create()
    $HashBytes = $Sha.ComputeHash($Stream)
    return ([BitConverter]::ToString($HashBytes)).Replace("-", "")
  }
  finally {
    $Stream.Dispose()
  }
}

Write-Host "`n== HX2 DB BACKUP HEALTH =="

if (-not (Test-Path $BackupRoot)) {
  throw "Backup root not found: $BackupRoot"
}

$Latest = Get-ChildItem $BackupRoot -Filter "hx2-db-public-*.dump" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $Latest) {
  throw "No portable public-schema HX2 DB backups found in $BackupRoot"
}

$Age = New-TimeSpan -Start $Latest.LastWriteTime -End (Get-Date)
$Hash = Get-Hx2FileSha256 -Path $Latest.FullName

Write-Host "Latest dump: $($Latest.FullName)"
Write-Host "Size bytes:  $($Latest.Length)"
Write-Host "Last write:  $($Latest.LastWriteTime)"
Write-Host "Age hours:   $([math]::Round($Age.TotalHours, 2))"
Write-Host "SHA256:      $Hash"

if ($Latest.Length -lt 10000) {
  throw "Latest backup is unexpectedly small."
}

if ($Age.TotalHours -gt $MaxAgeHours) {
  throw "Latest backup is older than $MaxAgeHours hours."
}

Write-Host "`n== PG_RESTORE READABILITY CHECK =="
pg_restore --list $Latest.FullName | Select-Object -First 30
if ($LASTEXITCODE -ne 0) {
  throw "pg_restore --list failed for latest backup."
}

$ScratchRoot = "C:\HX2-Backups\restore-tests"
New-Item -ItemType Directory -Force -Path $ScratchRoot | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$HealthManifest = Join-Path $ScratchRoot "hx2-db-backup-health-$Stamp.json"

$Manifest = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  backupRoot = $BackupRoot
  latestDump = $Latest.FullName
  length = $Latest.Length
  lastWriteTime = $Latest.LastWriteTime.ToString("o")
  ageHours = [math]::Round($Age.TotalHours, 2)
  maxAgeHours = $MaxAgeHours
  sha256 = $Hash
  readableByPgRestore = $true
  secretValuesIncluded = $false
}

$Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $HealthManifest -Encoding UTF8

Write-Host "`nGREEN: HX2 DB backup health passed."
Write-Host "Health manifest: $HealthManifest"
