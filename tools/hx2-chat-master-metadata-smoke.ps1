$ErrorActionPreference = "Stop"

param(
  [string]$Base = "https://optinodeiq.com",
  [switch]$LocalOnly
)

if ($LocalOnly) {
  $Base = "http://localhost:3000"
}

Write-Host ""
Write-Host "== HX2 CHAT MASTER METADATA SMOKE =="
Write-Host "Base: $Base"

$Endpoint = "$Base/api/hx2/chat-master"

$Checks = @(
  @{
    q = "Latest XRP news today"
    expectedSource = "hx2_retrieval"
    expectedOptimized = "X2 Markets Intelligence"
  },
  @{
    q = "current XLM DTCC update"
    expectedSource = "hx2_retrieval"
    expectedOptimized = "HX2 Retrieval Intelligence"
  },
  @{
    q = "what is DTCC"
    expectedSource = "hx2_retrieval"
    expectedOptimized = "HX2 Retrieval Intelligence"
  },
  @{
    q = "is magnesium safe daily?"
    expectedSource = "master_chat_direct_intelligence"
    expectedOptimized = "HX2 Master Chat Direct Intelligence"
  }
)

$Rows = @()

foreach ($Check in $Checks) {
  $Body = @{ message = $Check.q } | ConvertTo-Json -Depth 10
  $R = Invoke-RestMethod -Uri $Endpoint -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 90

  $SourceOk = [string]$R.source -eq [string]$Check.expectedSource
  $OptimizedOk = [string]$R.optimized_by -eq [string]$Check.expectedOptimized
  $AnswerOk = -not [string]::IsNullOrWhiteSpace([string]$R.answer)

  $Status = if ($SourceOk -and $OptimizedOk -and $AnswerOk) { "GREEN" } else { "RED" }

  $Rows += [pscustomobject]@{
    Query = $Check.q
    Status = $Status
    Source = [string]$R.source
    ExpectedSource = [string]$Check.expectedSource
    OptimizedBy = [string]$R.optimized_by
    ExpectedOptimizedBy = [string]$Check.expectedOptimized
  }
}

$Rows | Format-Table -AutoSize

$Red = $Rows | Where-Object { $_.Status -eq "RED" }

if ($Red) {
  throw "Metadata smoke failed."
}

Write-Host ""
Write-Host "GREEN: chat-master metadata smoke passed."
