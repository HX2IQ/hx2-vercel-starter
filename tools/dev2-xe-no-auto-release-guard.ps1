$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE NO AUTO-RELEASE GUARD =="
Write-Host "Scope: DEV2-XE tooling"
Write-Host "Rule: no automatic push or production deploy inside DEV2-XE scripts"
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
    Name = "git push"
    Pattern = "g" + "it\s+p" + "ush\b"
  },
  @{
    Name = "vercel prod deploy"
    Pattern = "v" + "ercel.*--prod|--prod.*v" + "ercel"
  },
  @{
    Name = "npm deploy script"
    Pattern = "n" + "pm\s+run\s+deploy\b"
  }
)

foreach ($Target in $Targets) {
  $Text = Get-Content $Target.FullName -Raw

  foreach ($Rule in $Forbidden) {
    if ($Text -match $Rule.Pattern) {
      Add-Row -Path $Target.Name -Status "RED" -Detail "contains forbidden auto-release pattern: $($Rule.Name)"
    }
  }

  if (-not ($Rows | Where-Object { $_.Path -eq $Target.Name -and $_.Status -eq "RED" })) {
    Add-Row -Path $Target.Name -Status "GREEN" -Detail "no auto-release pattern found"
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
  Meaning = "This guard ensures DEV2-XE tooling cannot quietly add automatic git push or production deploy behavior."
} | Format-List

if ($Red -gt 0) {
  throw "DEV2-XE no auto-release guard failed."
}

Write-Host "GREEN: DEV2-XE no auto-release guard passed."

