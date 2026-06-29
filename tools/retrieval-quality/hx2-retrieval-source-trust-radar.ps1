param(
  [string]$Base = "https://optinodeiq.com",
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETRIEVAL SOURCE TRUST RADAR =="
Write-Host "Base: $Base"
Write-Host "Strict: $Strict"
Write-Host "Mode: source trust classification"
Write-Host "Secrets printed: false"

$Base = $Base.TrimEnd("/")
$Url = "$Base/api/hx2/chat-master"

$Cases = @(
  @{
    Name = "Latest XRP"
    Query = "latest XRP news today"
    RequiredAny = @("XRP", "Ripple", "XRPL")
  },
  @{
    Name = "DTCC definition"
    Query = "what is DTCC"
    RequiredAny = @("Depository Trust", "DTCC")
  },
  @{
    Name = "Current XLM DTCC"
    Query = "current XLM DTCC update"
    RequiredAny = @("XLM", "Stellar", "DTCC", "tokenization")
  }
)

$HighTrustIndicators = @(
  "dtcc.com",
  "stellar.org",
  "ripple.com",
  "xrpl.org",
  "sec.gov",
  "reuters",
  "bloomberg",
  "coindesk",
  "the block",
  "yahoo finance",
  "ap news"
)

$WatchlistIndicators = @(
  "cointribune",
  "cryptorank",
  "coinmarketcap",
  "coingape",
  "u.today",
  "watcher guru",
  "the crypto basic",
  "bitcoinist",
  "ambcrypto"
)

function Test-AnyMatch {
  param(
    [string]$Text,
    [string[]]$Needles
  )

  foreach ($Needle in $Needles) {
    if ($Text -match [regex]::Escape($Needle)) {
      return $true
    }
  }

  return $false
}

function Get-AnswerText {
  param($Response)

  $Parts = @(
    $Response.answer,
    $Response.reply,
    $Response.message,
    $Response.content,
    $Response.text,
    $Response.source,
    $Response.optimized_by
  ) | Where-Object { $_ }

  return ($Parts -join "`n")
}

$Rows = @()

foreach ($Case in $Cases) {
  $Body = @{
    user_query = $Case.Query
  } | ConvertTo-Json -Depth 8

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 45
    $Text = Get-AnswerText -Response $Response
    $JsonText = $Response | ConvertTo-Json -Depth 20 -Compress
    $Combined = "$Text`n$JsonText"

    $HasRequired = Test-AnyMatch -Text $Combined -Needles $Case.RequiredAny
    $HasHighTrust = Test-AnyMatch -Text $Combined.ToLowerInvariant() -Needles $HighTrustIndicators
    $HasWatchlist = Test-AnyMatch -Text $Combined.ToLowerInvariant() -Needles $WatchlistIndicators

    $TrustStatus =
      if ($HasHighTrust -and -not $HasWatchlist) { "GREEN" }
      elseif ($HasHighTrust -and $HasWatchlist) { "YELLOW" }
      elseif ($HasWatchlist) { "YELLOW" }
      else { "UNKNOWN" }

    $PrimaryLine = (($Text -split "`n") | Where-Object { $_.Trim().Length -gt 0 } | Select-Object -First 1)

    $Rows += [pscustomobject]@{
      Case = $Case.Name
      RequiredSignal = if ($HasRequired) { "GREEN" } else { "RED" }
      TrustStatus = $TrustStatus
      HighTrustSeen = [bool]$HasHighTrust
      WatchlistSeen = [bool]$HasWatchlist
      PrimaryRead = $PrimaryLine
    }
  } catch {
    $Rows += [pscustomobject]@{
      Case = $Case.Name
      RequiredSignal = "RED"
      TrustStatus = "RED"
      HighTrustSeen = $false
      WatchlistSeen = $false
      PrimaryRead = $_.Exception.Message
    }
  }
}

Write-Host ""
Write-Host "SOURCE TRUST RADAR"
$Rows | Format-Table -AutoSize

$RedSignals = @($Rows | Where-Object { $_.RequiredSignal -eq "RED" -or $_.TrustStatus -eq "RED" }).Count
$WatchlistRows = @($Rows | Where-Object { $_.WatchlistSeen -eq $true }).Count
$UnknownRows = @($Rows | Where-Object { $_.TrustStatus -eq "UNKNOWN" }).Count

Write-Host ""
Write-Host "SOURCE TRUST SUMMARY"
[pscustomobject]@{
  RedSignals = $RedSignals
  WatchlistRows = $WatchlistRows
  UnknownRows = $UnknownRows
  Strict = [bool]$Strict
  Meaning = "This radar separates retrieval relevance from source trust. Watchlist sources do not fail non-strict mode yet; they identify where reranking should improve next."
} | Format-List

if ($RedSignals -gt 0) {
  throw "Retrieval source trust radar failed required signal checks."
}

if ($Strict -and ($WatchlistRows -gt 0 -or $UnknownRows -gt 0)) {
  throw "Strict source trust failed: watchlist or unknown source trust detected."
}

Write-Host "GREEN: HX2 retrieval source trust radar passed."

