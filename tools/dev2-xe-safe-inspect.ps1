param(
  [ValidateSet("all", "status", "routes", "tools", "scripts", "master", "verify")]
  [string]$Focus = "all"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2-XE SAFE REPO INSPECTION =="
Write-Host "Focus: $Focus"
Write-Host "Mode: read-only"
Write-Host "Secrets printed: false"

function Show-Section {
  param([string]$Title)
  Write-Host ""
  Write-Host "== $Title =="
}

function Should-Show {
  param([string]$Name)
  return $Focus -eq "all" -or $Focus -eq $Name
}

if (Should-Show "status") {
  Show-Section "GIT STATUS"
  $Status = git status --short
  if ($Status) {
    $Status
  } else {
    Write-Host "GREEN: working tree clean"
  }

  Show-Section "CURRENT BRANCH"
  git branch --show-current

  Show-Section "LATEST COMMITS"
  git log --oneline -8
}

if (Should-Show "routes") {
  Show-Section "HX2 ROUTE INVENTORY"
  if (Test-Path ".\app\api\hx2") {
    Get-ChildItem ".\app\api\hx2" -Recurse -Filter "route.ts" |
      Select-Object FullName, Length, LastWriteTime |
      Sort-Object FullName |
      Format-Table -AutoSize
  } else {
    Write-Host "YELLOW: app\api\hx2 not found"
  }
}

if (Should-Show "tools") {
  Show-Section "DEV2 / HX2 TOOL INVENTORY"
  if (Test-Path ".\tools") {
    Get-ChildItem ".\tools" -File |
      Where-Object { $_.Name -match "dev2|xe|verify|quick|guard|benchmark|bundle|sprint|policy" } |
      Select-Object Name, Length, LastWriteTime |
      Sort-Object Name |
      Format-Table -AutoSize
  } else {
    Write-Host "YELLOW: tools folder not found"
  }
}

if (Should-Show "scripts") {
  Show-Section "PACKAGE SCRIPT INVENTORY"
  if (Test-Path ".\package.json") {
    $Package = Get-Content ".\package.json" -Raw | ConvertFrom-Json
    $Package.scripts.PSObject.Properties |
      Where-Object { $_.Name -match "dev2|xe|hx2|verify|quick|guard|benchmark|retail|master-route" } |
      Sort-Object Name |
      Format-Table Name, Value -AutoSize
  } else {
    Write-Host "YELLOW: package.json not found"
  }
}

if (Should-Show "master") {
  Show-Section "CHAT MASTER ROUTE SHELL"
  $RouteFile = ".\app\api\hx2\chat-master\route.ts"

  if (Test-Path $RouteFile) {
    Get-Item $RouteFile |
      Select-Object FullName, Length, LastWriteTime |
      Format-List

    Write-Host ""
    Write-Host "-- route imports/top --"
    Get-Content $RouteFile -TotalCount 40
  } else {
    Write-Host "YELLOW: chat-master route not found"
  }

  Show-Section "MASTER MODULES"
  if (Test-Path ".\app\api\hx2\_lib") {
    Get-ChildItem ".\app\api\hx2\_lib" -File |
      Where-Object { $_.Name -match "master-" } |
      Select-Object Name, Length, LastWriteTime |
      Sort-Object Name |
      Format-Table -AutoSize
  } else {
    Write-Host "YELLOW: app\api\hx2\_lib not found"
  }
}

if (Should-Show "verify") {
  Show-Section "VERIFY POSTURE"
  if (Test-Path ".\tools\DEV2-XE-CHARTER.md") {
    Write-Host "GREEN: DEV2-XE charter present"
  } else {
    Write-Host "RED: DEV2-XE charter missing"
  }

  if (Test-Path ".\tools\dev2-xe-policy-guard.ps1") {
    Write-Host "GREEN: DEV2-XE policy guard present"
  } else {
    Write-Host "RED: DEV2-XE policy guard missing"
  }

  if (Test-Path ".\tools\hx2-master-route-shell-guard.ps1") {
    Write-Host "GREEN: master route shell guard present"
  } else {
    Write-Host "YELLOW: master route shell guard missing"
  }

  if (Test-Path ".\tools\hx2-quick-verify.ps1") {
    Write-Host "GREEN: quick verify present"
  } else {
    Write-Host "RED: quick verify missing"
  }
}

Show-Section "DEV2-XE INSPECTION SUMMARY"
[pscustomobject]@{
  Focus = $Focus
  ReadOnly = $true
  SecretsPrinted = $false
  Meaning = "This runner gives DEV2-XE a safe repo-awareness surface before controlled patch automation is added."
} | Format-List

Write-Host "GREEN: DEV2-XE safe repo inspection complete."

