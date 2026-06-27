param(
  [string]$EnvFile = ".env.recovery",
  [string]$BackupRoot = "C:\HX2-Backups\databases",
  [string]$Label = "manual"
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

$Url = Get-Hx2DatabaseUrl -Path $EnvFile
if ($Url -notmatch "^postgres") { throw "DATABASE_URL does not look like Postgres." }

$Uri = [System.Uri]$Url
$SafeLabel = ($Label -replace "[^a-zA-Z0-9._-]", "-").ToLowerInvariant()

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$DumpFile = Join-Path $BackupRoot "hx2-db-public-$SafeLabel-$Stamp.dump"
$ManifestFile = Join-Path $BackupRoot "hx2-db-public-$SafeLabel-$Stamp.manifest.json"

Write-Host "`n== HX2 DB BACKUP =="
Write-Host "Host:     $($Uri.Host)"
Write-Host "Database: $($Uri.AbsolutePath.TrimStart('/'))"
Write-Host "User:     $(($Uri.UserInfo -split ':', 2)[0])"
Write-Host "Schema:   public"
Write-Host "Password: <hidden>"
Write-Host "Dump:     $DumpFile"

pg_dump -Fc --schema=public --no-owner --no-privileges -d $Url -f $DumpFile
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed." }

$File = Get-Item $DumpFile
$Hash = Get-Hx2FileSha256 -Path $DumpFile

$Manifest = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  label = $SafeLabel
  host = $Uri.Host
  database = $Uri.AbsolutePath.TrimStart("/")
  user = (($Uri.UserInfo -split ":", 2)[0])
  schema = "public"
  dumpFile = $DumpFile
  length = $File.Length
  sha256 = $Hash
  secretValuesIncluded = $false
}

$Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $ManifestFile -Encoding UTF8

Write-Host "`n== BACKUP FILE =="
$File | Select-Object FullName, Length, LastWriteTime | Format-List

Write-Host "`n== BACKUP SHA256 =="
Write-Host $Hash

Write-Host "`nGREEN: HX2 DB backup complete."
Write-Host "Manifest: $ManifestFile"
