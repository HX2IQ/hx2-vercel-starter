param(
  [string]$BaseUrl = "https://optinodeiq.com"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "== DEV2 LIVE ROUTE DIFF =="

$Routes = Get-ChildItem ".\app\api\hx2" -Directory |
  Select-Object -ExpandProperty Name |
  Sort-Object

$Missing = @()

foreach ($Route in $Routes) {

  $Url = "$BaseUrl/api/hx2/${Route}?cb=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"

  try {

    Invoke-RestMethod $Url -ErrorAction Stop | Out-Null
    Write-Host "[LIVE] $Route"

  }
  catch {

    Write-Host "[MISSING] $Route"
    $Missing += $Route
  }
}

Write-Host ""

if ($Missing.Count -eq 0) {

  Write-Host "All local HX2 routes are reachable in production."
  exit 0
}

Write-Host "Missing live routes detected:"
$Missing

exit 1
