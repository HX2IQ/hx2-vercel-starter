param(
  [string]$Base = "https://optinodeiq.com",
  [switch]$LocalOnly
)

$ErrorActionPreference = "Stop"

if ($LocalOnly) {
  $Base = "http://localhost:3000"
}

Write-Host ""
Write-Host "== HX2 DIRECT INTELLIGENCE REGRESSION SMOKE =="
Write-Host "Base: $Base"

$Endpoint = "$Base/api/hx2/chat-master"

$Checks = @(
  @{
    q = "is magnesium safe daily?"
    source = "master_chat_direct_intelligence"
    optimized = "HX2 Master Chat Direct Intelligence"
    patterns = @("AH3 Quick Read", "magnesium", "glycinate")
  },
  @{
    q = "How can I get more leads at a trade show?"
    source = "master_chat_direct_intelligence"
    optimized = "HX2 Master Chat Direct Intelligence"
    patterns = @("TradeShowIQ Quick Read", "qualif", "follow[- ]?up")
  },
  @{
    q = "My 8 year old hates reading homework. What should I do?"
    source = "master_chat_direct_intelligence"
    optimized = "HX2 Master Chat Direct Intelligence"
    patterns = @("PA2 Reading Quick Read", "confidence", "Preview hard words")
  },
  @{
    q = "Latest XRP news today"
    source = "hx2_retrieval"
    optimized = "X2 Markets Intelligence"
    patterns = @("Latest retrieved read", "Supporting evidence", "Top sources checked")
  },
  @{
    q = "current XLM DTCC update"
    source = "hx2_retrieval"
    optimized = "HX2 Retrieval Intelligence"
    patterns = @("Latest retrieved read", "DTCC|DTC", "Top sources checked")
  },
  @{
    q = "what is DTCC"
    source = "hx2_retrieval"
    optimized = "HX2 Retrieval Intelligence"
    patterns = @("In plain English", "Depository Trust", "Supporting evidence")
  }
)

$Rows = @()

foreach ($Check in $Checks) {
  $Body = @{ message = $Check.q } | ConvertTo-Json -Depth 10
  $R = Invoke-RestMethod -Uri $Endpoint -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 90
  $Answer = [string]$R.answer

  $SourceOk = [string]$R.source -eq [string]$Check.source
  $OptimizedOk = [string]$R.optimized_by -eq [string]$Check.optimized
  $AnswerOk = -not [string]::IsNullOrWhiteSpace($Answer)
  $Missing = @()

  foreach ($Pattern in $Check.patterns) {
    if ($Answer -notmatch $Pattern) {
      $Missing += $Pattern
    }
  }

  $ContentOk = $Missing.Count -eq 0
  $Status = if ($SourceOk -and $OptimizedOk -and $AnswerOk -and $ContentOk) { "GREEN" } else { "RED" }

  $Rows += [pscustomobject]@{
    Query = $Check.q
    Status = $Status
    Source = [string]$R.source
    ExpectedSource = [string]$Check.source
    OptimizedBy = [string]$R.optimized_by
    ExpectedOptimizedBy = [string]$Check.optimized
    Missing = ($Missing -join ", ")
  }
}

$Rows | Format-Table -AutoSize

$Red = $Rows | Where-Object { $_.Status -eq "RED" }

if ($Red) {
  Write-Host ""
  Write-Host "RED CHECK DETAILS"
  $Red | Format-List
  throw "Direct intelligence regression smoke failed."
}

Write-Host ""
Write-Host "GREEN: direct intelligence regression smoke passed."
