param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$Checks = @(
  [pscustomobject]@{
    Name = "XRP definition"
    Query = "What is XRP?"
    MustContain = @("XRP Ledger")
    MustNotContain = @(
      "NewsNow",
      "CoinMarketCap",
      "Coinbase price",
      "Yahoo Finance",
      "market cap",
      "price today",
      "I can help with crypto prices"
    )
  },
  [pscustomobject]@{
    Name = "DTCC definition"
    Query = "What is DTCC?"
    MustContain = @("Depository Trust")
    MustNotContain = @(
      "I can help with that",
      "best available HX2 intelligence layer"
    )
  },
  [pscustomobject]@{
    Name = "Latest XRP news"
    Query = "What is the latest XRP news?"
    MustContain = @("Optimized by X2 Markets Intelligence")
    MustNotContain = @(
      "I checked X2 retrieval",
      "do not have a relevant current news result",
      "next upgrade should connect live web search",
      "NewsNow",
      "CoinMarketCap",
      "Coinbase price",
      "Yahoo Finance",
      "Nasdaq Skip",
      "marketcap",
      "claim community badge",
      "loading data",
      "Please try using other words",
      "Feed:",
      "news.google.com/rss"
    )
  },
  [pscustomobject]@{
    Name = "Bitcoin market update"
    Query = "Give me a current Bitcoin market update"
    MustContain = @("Optimized by X2 Markets Intelligence")
    MustNotContain = @(
      "News Video Prices Research Events",
      "Sponsored en Finance",
      "Copy link",
      "Share this article",
      "Skip to main content",
      "Please try using other words",
      "Feed:",
      "news.google.com/rss"
    )
  }
)

$Failures = 0

foreach ($Check in $Checks) {
  Write-Host "`n=============================="
  Write-Host "CHECK: $($Check.Name)"
  Write-Host "QUERY: $($Check.Query)"
  Write-Host "=============================="

  $Body = @{
    user_query = $Check.Query
  } | ConvertTo-Json -Depth 8

  try {
    $Res = Invoke-RestMethod `
      -Uri "$Base/api/hx2/chat-master" `
      -Method POST `
      -ContentType "application/json" `
      -Body $Body

    $Answer = [string]$Res.answer

    Write-Host "`nANSWER:"
    Write-Host $Answer

    foreach ($Needle in $Check.MustContain) {
      if ($Answer -notmatch [regex]::Escape($Needle)) {
        Write-Host "`nFAIL: Missing required phrase: $Needle"
        $Failures++
      }
    }

    foreach ($Bad in $Check.MustNotContain) {
      if ($Answer -match [regex]::Escape($Bad)) {
        Write-Host "`nFAIL: Forbidden phrase found: $Bad"
        $Failures++
      }
    }
  }
  catch {
    Write-Host "`nFAIL: Request error"
    Write-Host $_.Exception.Message
    $Failures++
  }
}

Write-Host "`n=============================="
Write-Host "RETRIEVAL QUALITY RESULT"
Write-Host "=============================="

if ($Failures -gt 0) {
  Write-Host "FAILED with $Failures issue(s)."
  exit 1
}

Write-Host "PASSED"
exit 0

