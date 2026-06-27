param(
  [Parameter(Mandatory=$false)]
  [string]$DumpFile
)

$ErrorActionPreference = "Stop"

if (-not $DumpFile) {
  $Latest = Get-ChildItem "C:\HX2-Backups\databases" -Filter "*.dump" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $Latest) {
    throw "No dump file supplied and no dumps found in C:\HX2-Backups\databases."
  }

  $DumpFile = $Latest.FullName
}

if (-not (Test-Path $DumpFile)) {
  throw "Dump file not found: $DumpFile"
}

Write-Host "`n== HX2 DB RESTORE-READINESS TEST =="
Write-Host "Dump: $DumpFile"

Write-Host "`n== PG_RESTORE LIST CHECK =="
pg_restore --list $DumpFile | Select-Object -First 40
if ($LASTEXITCODE -ne 0) { throw "pg_restore --list failed." }

$ScratchRoot = "C:\HX2-Backups\restore-tests"
New-Item -ItemType Directory -Force -Path $ScratchRoot | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$SchemaFile = Join-Path $ScratchRoot "hx2-restore-readiness-$Stamp.schema.sql"

Write-Host "`n== SCHEMA EXTRACTION CHECK =="
pg_restore --schema-only --file $SchemaFile $DumpFile
if ($LASTEXITCODE -ne 0) { throw "pg_restore schema extraction failed." }

Get-Item $SchemaFile | Select-Object FullName, Length, LastWriteTime | Format-List

Write-Host "`nGREEN: Dump is readable and schema can be extracted."
Write-Host "Note: This is a non-destructive restore-readiness test, not a live database restore."
