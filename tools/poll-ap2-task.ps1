param(
  [Parameter(Mandatory=$true)][string]$TaskId,
  [int]$MaxSeconds = 60
)

$Base = $env:HX2_BASE_URL
if (-not $Base) { $Base = "https://optinodeiq.com" }

$Key = $env:HX2_API_KEY

$headers = @{}
if ($Key) { $headers["Authorization"] = "Bearer $Key" }

$start = Get-Date
for ($i=0; $i -lt $MaxSeconds; $i++) {
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $uri = "$Base/api/ap2/task/status?taskId=$TaskId&ts=$ts"
  try {
    $r = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
    $state = $r.state
    Write-Host ("t={0} state={1}" -f $i, $state)
    if ($state -and $state -notin @("ENQUEUED","RUNNING")) {
      $r | ConvertTo-Json -Depth 30
      exit 0
    }
  } catch {
    Write-Host ("t={0} status check failed: {1}" -f $i, $_.Exception.Message) -ForegroundColor Yellow
  }
  Start-Sleep -Seconds 1
}

Write-Host "POLL TIMEOUT" -ForegroundColor Red
exit 2
