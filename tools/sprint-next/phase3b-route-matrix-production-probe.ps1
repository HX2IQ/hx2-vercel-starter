param(
  [string]$BaseUrl = "https://optinodeiq.com",
  [int]$Retries = 6,
  [int]$DelaySeconds = 15
)

$ErrorActionPreference = "Stop"

function Invoke-WithRetry {
  param([string]$Url)

  $LastError = $null

  for ($Attempt = 1; $Attempt -le $Retries; $Attempt++) {
    try {
      Write-Host "Probe attempt $Attempt of $Retries`: $Url"
      return Invoke-RestMethod $Url
    } catch {
      $LastError = $_.Exception.Message
      if ($Attempt -lt $Retries) {
        Start-Sleep -Seconds $DelaySeconds
      }
    }
  }

  throw "Probe failed after $Retries attempts: $Url. Last error: $LastError"
}

function Get-ModeValues {
  param($Response)

  return $Response.PSObject.Properties |
    Where-Object { $_.Name -match "_mode$" } |
    ForEach-Object { $_.Value } |
    Where-Object { $_ }
}

Write-Host ""
Write-Host "== PHASE 3B ROUTE MATRIX PRODUCTION PROBE =="

$MatrixUrl = "$BaseUrl/api/hx2/phase3b-route-matrix"
$Matrix = Invoke-WithRetry -Url $MatrixUrl

if ($Matrix.ok -ne $true) {
  throw "Route matrix did not return ok=true"
}

if ($Matrix.matrix_mode -ne "read_only_contract") {
  throw "Route matrix mode mismatch: $($Matrix.matrix_mode)"
}

foreach ($Entry in $Matrix.routes) {
  $Url = "$BaseUrl$($Entry.route)"

  Write-Host ""
  Write-Host "== PROBE MATRIX ROUTE: $Url =="

  $Response = Invoke-WithRetry -Url $Url

  if ($Response.route -ne $Entry.route) {
    throw "Route marker mismatch for $($Entry.route): got $($Response.route)"
  }

  $ModeValues = @(Get-ModeValues -Response $Response)

  if ($ModeValues -notcontains $Entry.expected_mode) {
    throw "Expected mode '$($Entry.expected_mode)' not found for $($Entry.route). Got: $($ModeValues -join ', ')"
  }
}

Write-Host ""
Write-Host "PHASE 3B ROUTE MATRIX PRODUCTION PROBE PASSED"
