param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

if (-not $env:HX2_API_KEY) {
  throw "HX2_API_KEY is not set in this PowerShell session."
}

$Auth = "Bearer $env:HX2_API_KEY"
$HJson = @{ Authorization = $Auth; "Content-Type" = "application/json" }
$HAuth = @{ Authorization = $Auth }

$body = (@{ task="ping"; mode="SAFE"; detail="SMOKE_AP2" } | ConvertTo-Json -Depth 10)

Write-Host "== enqueue =="
$resp = Invoke-WebRequest "$Base/api/ap2/task/enqueue" -Method Post -Headers $HJson -Body $body -TimeoutSec 30
$enq = $resp.Content | ConvertFrom-Json
$taskId = $enq.task.id

Write-Host ("HTTP={0} taskId={1} routever={2}" -f $resp.StatusCode, $taskId, (($resp.Headers['x-chat-route-version'] -join ',')))

if (-not $taskId) {
  throw "No task id returned."
}

Write-Host "== poll status =="
$done = $false
1..15 | ForEach-Object {
  Start-Sleep 2
  $r = Invoke-WebRequest "$Base/api/ap2/task/status?taskId=$taskId" -Headers $HAuth -TimeoutSec 30 -SkipHttpErrorCheck
  $st = $null
  try { $st = $r.Content | ConvertFrom-Json } catch {}
  $state = if ($st) { $st.state } else { "" }
  $err   = if ($st) { $st.error } else { "" }

  Write-Host ("t+{0,2}s http={1} state={2} err={3}" -f ($_*2), $r.StatusCode, $state, $err)

  if ($state -match "COMPLETED|FAILED") {
    $done = $true
    if ($state -ne "COMPLETED") {
      throw "Smoke test failed. Final state: $state error: $err"
    }
    return
  }
}

if (-not $done) {
  throw "Smoke test timed out without reaching COMPLETED/FAILED."
}

Write-Host "AP2 smoke test PASSED."
