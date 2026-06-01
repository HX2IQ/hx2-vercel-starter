$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== DEV2 ROUTE INVENTORY SNAPSHOT =="

$Output = ".\tools\_route-inventory"

if (!(Test-Path $Output)) {
  New-Item -ItemType Directory -Path $Output | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$OutFile = "$Output\route-inventory-$Timestamp.txt"

Get-ChildItem ".\app\api" -Recurse -Filter route.ts |
  Select-Object FullName |
  Out-File $OutFile -Encoding UTF8

Write-Host ""
Write-Host "Inventory written:"
Write-Host $OutFile
