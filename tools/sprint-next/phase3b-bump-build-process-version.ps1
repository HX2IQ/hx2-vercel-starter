param(
  [Parameter(Mandatory=$true)]
  [string]$NewVersion,
  [Parameter(Mandatory=$true)]
  [string]$ReleaseNote
)

$ErrorActionPreference = "Stop"

$VersionPath = "app/api/hx2/_lib/phase3b-build-process-version.ts"
$NumberGuardPath = "tools/sprint-next/phase3b-build-process-version-number-guard.ps1"
$ReleaseNotesGuardPath = "tools/sprint-next/phase3b-release-notes-consistency-guard.ps1"
$ReleaseNotesProbePath = "tools/sprint-next/phase3b-release-notes-production-probe.ps1"

foreach ($Path in @($VersionPath, $NumberGuardPath, $ReleaseNotesGuardPath, $ReleaseNotesProbePath)) {
  if (!(Test-Path $Path)) {
    throw "Missing version bump target: $Path"
  }
}

$Version = Get-Content $VersionPath -Raw
$OldMatch = [regex]::Match($Version, 'process_version:\s*"([^"]+)"')

if (-not $OldMatch.Success) {
  throw "Could not detect current process_version"
}

$OldVersion = $OldMatch.Groups[1].Value

$Version = $Version.Replace("process_version: `"$OldVersion`"", "process_version: `"$NewVersion`"")

if (-not $Version.Contains($ReleaseNote)) {
  $Version = $Version.Replace("`"Build process upgraded to $OldVersion`"", @"
"Build process upgraded to $OldVersion",
      "$ReleaseNote",
      "Build process upgraded to $NewVersion"
"@)
}

Set-Content $VersionPath $Version -Encoding UTF8

foreach ($Path in @($ReleaseNotesGuardPath, $ReleaseNotesProbePath)) {
  $Content = Get-Content $Path -Raw

  if (-not $Content.Contains($ReleaseNote)) {
    $Content = $Content.Replace("`"Build process upgraded to $OldVersion`"", @"
"Build process upgraded to $OldVersion",
  "$ReleaseNote",
  "Build process upgraded to $NewVersion"
"@)
  }

  Set-Content $Path $Content -Encoding UTF8
}

$NumberGuard = Get-Content $NumberGuardPath -Raw
$NumberGuard = $NumberGuard.Replace($OldVersion.Replace(".", "\."), $NewVersion.Replace(".", "\."))
$NumberGuard = $NumberGuard.Replace($OldVersion, $NewVersion)
Set-Content $NumberGuardPath $NumberGuard -Encoding UTF8

Write-Host "Build process version bumped: $OldVersion -> $NewVersion"
Write-Host "Release note: $ReleaseNote"
