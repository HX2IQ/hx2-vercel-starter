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
    type = "direct"
    source = "master_chat_direct_intelligence"
    optimizedAny = @("HX2 Master Chat Direct Intelligence")
    requiredAll = @("AH3 Quick Read", "magnesium")
    requiredAny = @("glycinate", "citrate", "oxide")
  },
  @{
    q = "How can I get more leads at a trade show?"
    type = "direct"
    source = "master_chat_direct_intelligence"
    optimizedAny = @("HX2 Master Chat Direct Intelligence")
    requiredAll = @("TradeShowIQ Quick Read")
    requiredAny = @("qualif", "lead", "follow[- ]?up")
  },
  @{
    q = "My 8 year old hates reading homework. What should I do?"
    type = "direct"
    source = "master_chat_direct_intelligence"
    optimizedAny = @("HX2 Master Chat Direct Intelligence")
    requiredAll = @("PA2 Reading Quick Read")
    requiredAny = @("confidence", "Preview hard words", "reading")
  },
  @{
    q = "Latest XRP news today"
    type = "retrieval"
    source = "hx2_retrieval"
    optimizedAny = @("X2 Markets Intelligence", "HX2 Retrieval Intelligence")
    requiredAll = @()
    requiredAny = @("Latest retrieved read", "Supporting evidence", "Top sources checked", "XRP", "Ripple")
  },
  @{
    q = "current XLM DTCC update"
    type = "retrieval"
    source = "hx2_retrieval"
    optimizedAny = @("HX2 Retrieval Intelligence", "X2 Markets Intelligence")
    requiredAll = @()
    requiredAny = @("Latest retrieved read", "Supporting evidence", "Top sources checked", "XLM", "Stellar", "DTCC", "DTC")
  },
  @{
    q = "what is DTCC"
    type = "retrieval"
    source = "hx2_retrieval"
    optimizedAny = @("HX2 Retrieval Intelligence", "X2 Markets Intelligence")
    requiredAll = @("In plain English")
    requiredAny = @("Depository Trust", "clearing", "settlement", "DTCC")
  }
)

function Test-AnyPattern {
  param(
    [string]$Text,
    [object[]]$Patterns
  )

  foreach ($Pattern in $Patterns) {
    if ($Text -match [string]$Pattern) {
      return $true
    }
  }

  return $false
}

$Rows = @()

foreach ($Check in $Checks) {
  $Body = @{ message = $Check.q } | ConvertTo-Json -Depth 10
  $R = Invoke-RestMethod -Uri $Endpoint -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 90
  $Answer = [string]$R.answer
  $OptimizedBy = [string]$R.optimized_by

  $SourceOk = [string]$R.source -eq [string]$Check.source
  $OptimizedOk = $Check.optimizedAny -contains $OptimizedBy
  $AnswerOk = -not [string]::IsNullOrWhiteSpace($Answer)
  $Missing = @()

  foreach ($Pattern in $Check.requiredAll) {
    if ($Answer -notmatch [string]$Pattern) {
      $Missing += [string]$Pattern
    }
  }

  if ($Check.requiredAny.Count -gt 0 -and -not (Test-AnyPattern -Text $Answer -Patterns $Check.requiredAny)) {
    $Missing += ("ANY(" + ($Check.requiredAny -join " | ") + ")")
  }

  $ContentOk = $Missing.Count -eq 0
  $Status = if ($SourceOk -and $OptimizedOk -and $AnswerOk -and $ContentOk) { "GREEN" } else { "RED" }

  $Rows += [pscustomobject]@{
    Query = $Check.q
    Type = $Check.type
    Status = $Status
    Source = [string]$R.source
    ExpectedSource = [string]$Check.source
    OptimizedBy = $OptimizedBy
    AllowedOptimizedBy = ($Check.optimizedAny -join " / ")
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
