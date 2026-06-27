param(
  [string]$EnvFile = ".env.recovery",
  [string]$ManifestRoot = "C:\HX2-Backups\manifests"
)

$ErrorActionPreference = "Stop"

function Get-Hx2DatabaseUrl {
  param([string]$Path)

  if (Test-Path $Path) {
    $Line = Get-Content $Path | Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } | Select-Object -First 1
    if ($Line) {
      return (($Line -replace "^\s*DATABASE_URL\s*=\s*", "").Trim('"').Trim("'"))
    }
  }

  if ($env:DATABASE_URL) {
    return $env:DATABASE_URL
  }

  throw "DATABASE_URL not found in $Path or process environment."
}

$Url = Get-Hx2DatabaseUrl -Path $EnvFile

if ($Url -notmatch "^postgres") {
  throw "DATABASE_URL does not look like Postgres."
}

$Uri = [System.Uri]$Url
$User = ($Uri.UserInfo -split ":", 2)[0]
$Database = $Uri.AbsolutePath.TrimStart("/")

Write-Host "`n== HX2 DB INVENTORY =="
Write-Host "Host:     $($Uri.Host)"
Write-Host "Database: $Database"
Write-Host "User:     $User"
Write-Host "Password: <hidden>"

Write-Host "`n== CONNECTION CHECK =="
psql $Url -v ON_ERROR_STOP=1 -c "select current_database() as database, current_user as user_name, now() as checked_at;"
if ($LASTEXITCODE -ne 0) { throw "DB connection check failed." }

Write-Host "`n== DATABASE SIZE =="
psql $Url -v ON_ERROR_STOP=1 -c "select pg_size_pretty(pg_database_size(current_database())) as database_size;"
if ($LASTEXITCODE -ne 0) { throw "Database size query failed." }

Write-Host "`n== TABLES =="
psql $Url -v ON_ERROR_STOP=1 -c "select table_name from information_schema.tables where table_schema='public' order by table_name;"
if ($LASTEXITCODE -ne 0) { throw "Table inventory failed." }

Write-Host "`n== HX2 TABLE COUNTS =="

$CountFile = Join-Path $env:TEMP "hx2-db-counts.sql"

@"
select 'Node' as table_name, count(*) from "Node"
union all select 'ExecutionEvent', count(*) from "ExecutionEvent"
union all select 'CapabilityPlan', count(*) from "CapabilityPlan"
union all select 'MemoryRecord', count(*) from "MemoryRecord"
union all select 'AuditEvent', count(*) from "AuditEvent"
union all select 'KgxRelationship', count(*) from "KgxRelationship"
union all select 'ap2_proof_events', count(*) from ap2_proof_events
union all select 'ap2_tasks', count(*) from ap2_tasks;
"@ | Set-Content -Path $CountFile -Encoding UTF8

psql $Url -v ON_ERROR_STOP=1 -f $CountFile
$CountExit = $LASTEXITCODE
Remove-Item $CountFile -Force -ErrorAction SilentlyContinue

if ($CountExit -ne 0) { throw "HX2 table count query failed." }

New-Item -ItemType Directory -Force -Path $ManifestRoot | Out-Null
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ManifestFile = Join-Path $ManifestRoot "hx2-db-inventory-$Stamp.json"

$Manifest = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  host = $Uri.Host
  database = $Database
  user = $User
  envFile = $EnvFile
  secretValuesIncluded = $false
}

$Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $ManifestFile -Encoding UTF8

Write-Host "`nGREEN: DB inventory complete."
Write-Host "Manifest: $ManifestFile"
