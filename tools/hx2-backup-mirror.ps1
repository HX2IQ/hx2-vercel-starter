param(
  [string]$SourceRoot = "C:\HX2-Backups",
  [string]$MirrorRoot = "",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceRoot)) {
  throw "Source backup root not found: $SourceRoot"
}

if (-not $MirrorRoot) {
  if ($env:OneDrive -and (Test-Path $env:OneDrive)) {
    $MirrorRoot = Join-Path $env:OneDrive "HX2-Backups-Mirror"
  } else {
    $MirrorRoot = "C:\HX2-Backups-Mirror"
  }
}

Write-Host "`n== HX2 BACKUP MIRROR =="
Write-Host "Source:  $SourceRoot"
Write-Host "Mirror:  $MirrorRoot"
Write-Host "DryRun:  $DryRun"
Write-Host "Secrets printed: false"

$Files = Get-ChildItem $SourceRoot -Recurse -File -ErrorAction SilentlyContinue

if (-not $Files) {
  throw "No backup files found under $SourceRoot"
}

$Copied = 0
$Skipped = 0

foreach ($File in $Files) {
  $Relative = $File.FullName.Substring($SourceRoot.Length).TrimStart("\")
  $Target = Join-Path $MirrorRoot $Relative
  $TargetDir = Split-Path $Target -Parent

  $NeedsCopy = $true

  if (Test-Path $Target) {
    $TargetFile = Get-Item $Target
    if ($TargetFile.Length -eq $File.Length -and $TargetFile.LastWriteTime -ge $File.LastWriteTime) {
      $NeedsCopy = $false
    }
  }

  if ($NeedsCopy) {
    Write-Host "COPY: $Relative"
    if (-not $DryRun) {
      New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
      Copy-Item -Path $File.FullName -Destination $Target -Force
    }
    $Copied++
  } else {
    $Skipped++
  }
}

$ManifestRoot = Join-Path $MirrorRoot "mirror-manifests"
if (-not $DryRun) {
  New-Item -ItemType Directory -Force -Path $ManifestRoot | Out-Null
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ManifestFile = Join-Path $ManifestRoot "hx2-backup-mirror-$Stamp.json"

$Manifest = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  sourceRoot = $SourceRoot
  mirrorRoot = $MirrorRoot
  dryRun = [bool]$DryRun
  fileCount = $Files.Count
  copied = $Copied
  skipped = $Skipped
  secretValuesIncluded = $false
}

if (-not $DryRun) {
  $Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $ManifestFile -Encoding UTF8
}

Write-Host "`nMirror summary:"
Write-Host "Files found: $($Files.Count)"
Write-Host "Copied:      $Copied"
Write-Host "Skipped:     $Skipped"

if (-not $DryRun) {
  Write-Host "Manifest:    $ManifestFile"
}

Write-Host "`nGREEN: HX2 backup mirror complete."
