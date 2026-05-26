param(
  [string]$BaseUrl = "https://optinodeiq.com",
  [string]$ExecutionId = "manual_exec",
  [ValidateSet("pending","success","guard_failure")]
  [string]$RuntimeStatus = "success",
  [string[]]$CompletedGuards = @("npm run hx2:quick", "npm run hx2:chat-master:guard")
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== RECORD ORCHESTRATION OUTCOME =="

$body = @{
  execution_id = $ExecutionId
  runtime_status = $RuntimeStatus
  completed_guards = $CompletedGuards
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
  -Method POST `
  -Uri "$BaseUrl/api/hx2/orchestration-outcome" `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "Outcome record submitted."
