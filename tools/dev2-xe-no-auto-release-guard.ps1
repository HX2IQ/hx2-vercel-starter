$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE NO AUTO-RELEASE GUARD =="
Write-Host "Scope: DEV2-XE tooling"
Write-Host "Rule: no automatic source-control release or production release inside DEV2-XE scripts"
Write-Host "Secrets printed: false"

$Targets = @()

if (Test-Path ".\tools") {
  $Targets += Get-ChildItem ".\tools" -File |
    Where-Object {
      $_.Name -match "^dev2-xe-.*\.ps1$" -or
      $_.Name -eq "DEV2-XE-CHARTER.md"
    }
}

$Rows = @()

function Add-Row {
  param(
    [string]$Path,
    [string]$Status,
    [string]$Detail
  )

  $script:Rows += [pscustomobject]@{
    Path = $Path
    Status = $Status
    Detail = $Detail
  }
}

$Forbidden = @(
  @{
    Name = "source-control push command"
    Pattern = "^\s*(git|&\s*git|cmd\.exe.*git)\s+push\b"
  },
  @{
    Name = "production Vercel deploy command"
    Pattern = "^\s*(npx\s+)?vercel\b.*--prod\b"
  },
  @{
    Name = "npm deploy command"
    Pattern = "^\s*npm\s+run\s+deploy\b"
  }
)

foreach ($Target in $Targets) {
  $Lines = @(Get-Content $Target.FullName)
  $RedForTarget = $false

  for ($i = 0; $i -lt $Lines.Count; $i++) {
    $Line = $Lines[$i]

    foreach ($Rule in $Forbidden) {
      if ($Line -match $Rule.Pattern) {
        Add-Row -Path $Target.Name -Status "RED" -Detail "line $($i + 1) contains forbidden executable auto-release command: $($Rule.Name)"
        $RedForTarget = $true
      }
    }
  }

  if (-not $RedForTarget) {
    Add-Row -Path $Target.Name -Status "GREEN" -Detail "no executable auto-release command found"
  }
}

if (-not $Targets -or $Targets.Count -eq 0) {
  Add-Row -Path "tools" -Status "RED" -Detail "no DEV2-XE files found to scan"
}

$Rows | Sort-Object Path, Status | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count
$Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count

Write-Host ""
Write-Host "DEV2-XE NO AUTO-RELEASE SUMMARY"
[pscustomobject]@{
  Green = $Green
  Red = $Red
  Meaning = "This guard ensures DEV2-XE tooling cannot quietly add executable source-control push or production-release commands."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2-XE no auto-release guard failed."
}

Write-Host "GREEN: DEV2-XE no auto-release guard passed."

