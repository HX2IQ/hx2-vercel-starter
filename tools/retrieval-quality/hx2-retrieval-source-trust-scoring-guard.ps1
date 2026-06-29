$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETRIEVAL SOURCE TRUST SCORING GUARD =="
Write-Host "Mode: static runtime scoring contract"
Write-Host "Secrets printed: false"

$File = ".\app\api\hx2\_lib\unified-retrieval.ts"

if (-not (Test-Path $File)) {
  throw "Missing unified retrieval file: $File"
}

$Text = Get-Content $File -Raw

$Checks = @(
  @{
    Marker = "retrievalSourceTrustScore helper"
    Pattern = "function retrievalSourceTrustScore\("
  },
  @{
    Marker = "scoring helper wired"
    Pattern = "score \+= retrievalSourceTrustScore\(query, item, haystack\);"
  },
  @{
    Marker = "authoritative DTCC boost"
    Pattern = "dtcc\\.com"
  },
  @{
    Marker = "authoritative Stellar boost"
    Pattern = "stellar\\.org"
  },
  @{
    Marker = "authoritative Ripple/XRPL boost"
    Pattern = "ripple\\.com|xrpl\\.org"
  },
  @{
    Marker = "watchlist Cointribune demotion"
    Pattern = "cointribune"
  },
  @{
    Marker = "watchlist CryptoRank demotion"
    Pattern = "cryptorank"
  },
  @{
    Marker = "watchlist CoinMarketCap demotion"
    Pattern = "coinmarketcap"
  },
  @{
    Marker = "fresh watchlist penalty"
    Pattern = "score -= fresh \? 40 : 24;"
  },
  @{
    Marker = "generic aggregator penalty"
    Pattern = "score -= 10;"
  }
)

$Rows = @()

foreach ($Check in $Checks) {
  $Pass = $Text -match $Check.Pattern

  $Rows += [pscustomobject]@{
    Marker = $Check.Marker
    Status = if ($Pass) { "GREEN" } else { "RED" }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

Write-Host ""
Write-Host "SOURCE TRUST SCORING SUMMARY"
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "Confirms runtime retrieval ranking has explicit authority boosts and crypto aggregator demotions."
} | Format-List

if ($Red -gt 0) {
  throw "Retrieval source trust scoring guard failed."
}

Write-Host "GREEN: HX2 retrieval source trust scoring guard passed."

