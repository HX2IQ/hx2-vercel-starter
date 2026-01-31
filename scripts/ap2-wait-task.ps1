param(
  [Parameter(Mandatory=$true)][string]$TaskId,
  [Parameter(Mandatory=$true)][string]$Base,
  [int]$TimeoutSec = 60,
  [int]$PollMs = 1200
)

$ErrorActionPreference="Stop"

$HX2 = $env:HX2_API_KEY
if (-not $HX2) { throw "HX2_API_KEY env var not set" }

$headers = @{
  "Content-Type"  = "application/json"
  "Authorization" = "Bearer $HX2"
}

$deadline = (Get-Date).AddSeconds($TimeoutSec)

while ((Get-Date) -lt $deadline) {
  try {
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $body = @{ taskId = $TaskId; mode="SAFE"; detail="FULL" } | ConvertTo-Json -Depth 10

    $r = Invoke-RestMethod `
      -Uri "$Base/api/ap2/task/status?ts=$ts" `
      -Method Post `
      -Headers $headers `
      -Body $body `
      -TimeoutSec 30

    $state = $r.state
    $found = $r.found

    Write-Host ("state={0} found={1}" -f $state,$found)

    if ($found -and $state -eq "DONE") {
      $r | ConvertTo-Json -Depth 30
      exit 0
    }

    if ($found -and $state -eq "ERROR") {
      Write-Host ("ERROR: {0}" -f $TaskId) -ForegroundColor Red
      $r | ConvertTo-Json -Depth 30
      exit 1
    }

  } catch {
    Write-Host ("poll error: " + $_.Exception.Message) -ForegroundColor Yellow
  }

  Start-Sleep -Milliseconds $PollMs
}

Write-Host ("TIMEOUT waiting for {0}" -f $TaskId) -ForegroundColor Yellow
exit 2