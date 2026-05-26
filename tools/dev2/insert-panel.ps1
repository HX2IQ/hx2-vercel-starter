param(
  [Parameter(Mandatory=$true)]
  [string]$TargetFile,

  [Parameter(Mandatory=$true)]
  [string]$Anchor,

  [Parameter(Mandatory=$true)]
  [string]$InsertFile,

  [ValidateSet("before","after")]
  [string]$Mode = "before"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $TargetFile)) {
  throw "Target file not found: $TargetFile"
}

if (!(Test-Path $InsertFile)) {
  throw "Insert file not found: $InsertFile"
}

$target = Get-Content $TargetFile -Raw
$insert = Get-Content $InsertFile -Raw

$idx = $target.IndexOf($Anchor)

if ($idx -lt 0) {
  throw "Anchor not found: $Anchor"
}

if ($target.Contains($insert.Trim())) {
  Write-Host "Insert already present. No changes made."
  exit 0
}

if ($Mode -eq "before") {
  $updated = $target.Substring(0, $idx) + $insert + $target.Substring($idx)
} else {
  $updated = $target.Substring(0, $idx + $Anchor.Length) + $insert + $target.Substring($idx + $Anchor.Length)
}

Set-Content $TargetFile $updated

Write-Host "Panel insertion completed."
