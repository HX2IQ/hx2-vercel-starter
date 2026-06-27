param(
  [string]$TargetEnvFile = ".env.restore-test",
  [string]$DumpFile = "",
  [switch]$SchemaOnly,
  [switch]$AllowNonScratchTarget,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-Hx2DatabaseUrl {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    throw "Target env file not found: $Path"
  }

  $Line = Get-Content $Path | Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } | Select-Object -First 1
  if (-not $Line) {
    throw "DATABASE_URL not found in $Path"
  }

  return (($Line -replace "^\s*DATABASE_URL\s*=\s*", "").Trim('"').Trim("'"))
}

if (-not $DumpFile) {
  $Latest = Get-ChildItem "C:\HX2-Backups\databases" -Filter "hx2-db-public-*.dump" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $Latest) {
    throw "No portable public-schema dump found in C:\HX2-Backups\databases."
  }

  $DumpFile = $Latest.FullName
}

if (-not (Test-Path $DumpFile)) {
  throw "Dump file not found: $DumpFile"
}

$TargetUrl = Get-Hx2DatabaseUrl -Path $TargetEnvFile

if ($TargetUrl -notmatch "^postgres") {
  throw "Target DATABASE_URL does not look like Postgres."
}

$Uri = [System.Uri]$TargetUrl
$Database = $Uri.AbsolutePath.TrimStart("/")
$User = ($Uri.UserInfo -split ":", 2)[0]

Write-Host "`n== HX2 GUARDED RESTORE TO TARGET =="
Write-Host "Dump:       $DumpFile"
Write-Host "TargetHost: $($Uri.Host)"
Write-Host "TargetDb:   $Database"
Write-Host "TargetUser: $User"
Write-Host "Password:   <hidden>"
Write-Host "SchemaOnly: $SchemaOnly"
Write-Host "DryRun:     $DryRun"

$ScratchNameOk =
  $Database -match "restore" -or
  $Database -match "scratch" -or
  $Database -match "test"

if (-not $ScratchNameOk -and -not $AllowNonScratchTarget) {
  throw "Refusing restore because target database name does not contain restore/scratch/test. Use a scratch DB or pass -AllowNonScratchTarget intentionally."
}

Write-Host "`n== DUMP READABILITY CHECK =="
pg_restore --list $DumpFile | Select-Object -First 30
if ($LASTEXITCODE -ne 0) {
  throw "pg_restore --list failed."
}

if ($DryRun) {
  Write-Host "`nGREEN: Dry run passed. Restore command was not executed."
  exit 0
}

Write-Host "`n== TARGET CONNECTION CHECK =="
psql $TargetUrl -v ON_ERROR_STOP=1 -c "select current_database() as database, current_user as user_name, now() as checked_at;"
if ($LASTEXITCODE -ne 0) {
  throw "Target connection check failed."
}

Write-Host "`n== RESTORE EXECUTION =="

if ($SchemaOnly) {
  pg_restore --schema-only --clean --if-exists --no-owner --no-privileges -d $TargetUrl $DumpFile
} else {
  pg_restore --clean --if-exists --no-owner --no-privileges -d $TargetUrl $DumpFile
}

if ($LASTEXITCODE -ne 0) {
  throw "pg_restore to target failed."
}

Write-Host "`n== POST-RESTORE TABLE CHECK =="
psql $TargetUrl -v ON_ERROR_STOP=1 -c "select table_name from information_schema.tables where table_schema='public' order by table_name;"
if ($LASTEXITCODE -ne 0) {
  throw "Post-restore table check failed."
}

Write-Host "`nGREEN: HX2 restore-to-target completed."
