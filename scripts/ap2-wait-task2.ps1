param(
  [Parameter(Mandatory=$true)][string]$TaskId,
  [Parameter(Mandatory=$true)][string]$Base,
  [Parameter(Mandatory=$true)][string]$HX2,
  [int]$TimeoutSec = 90
)

$start = Get-Date
$delayMs = 250

while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
  try {
    $st = Invoke-RestMethod -Method Get -Uri "$Base/api/ap2/task/status?taskId=$TaskId" -Headers @{ Authorization="Bearer $HX2" } -TimeoutSec 20
  } catch {
    Start-Sleep -Milliseconds $delayMs
    $delayMs = [Math]::Min([int]($delayMs * 1.4), 1500)
    continue
  }

  if ($st.state -eq "DONE") {
    $st | ConvertTo-Json -Depth 50
    exit 0
  }

  Start-Sleep -Milliseconds $delayMs
  $delayMs = [Math]::Min([int]($delayMs * 1.4), 1500)
}

throw "Timeout waiting for task DONE: $TaskId"
