param(
  [string]$Base = "https://optinodeiq.com",
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 RETRIEVAL SOURCE TRUST RADAR =="
Write-Host "Base: $Base"
Write-Host "Strict: $Strict"
Write-Host "Mode: evidence-aware source trust classification"
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
  "reuters.com",
  "bloomberg",
  "bloomberg.com",
  "coindesk",
  "coindesk.com",
  "the block",
  "theblock.co",
  "decrypt",
  "decrypt.co",
  "cnbc",
  "cnbc.com",
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

function Add-TrustPart {
  param(
    [System.Collections.Generic.List[string]]$Parts,
    [object]$Value
  )

  if ($null -eq $Value) {
    return
  }

  $Text = ([string]$Value).Trim()

  if ($Text.Length -gt 0) {
    $Parts.Add($Text) | Out-Null
  }
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

function Get-StructuredEvidenceText {
  param($Response)

  $Parts = New-Object System.Collections.Generic.List[string]

  foreach ($Domain in @($Response.source_domains)) {
    Add-TrustPart -Parts $Parts -Value $Domain
  }

  foreach ($Title in @($Response.source_titles)) {
    Add-TrustPart -Parts $Parts -Value $Title
  }

  foreach ($Url in @($Response.source_urls)) {
    Add-TrustPart -Parts $Parts -Value $Url
  }

  foreach ($Item in @($Response.source_evidence)) {
    if ($null -eq $Item) {
      continue
    }

    Add-TrustPart -Parts $Parts -Value $Item.title
    Add-TrustPart -Parts $Parts -Value $Item.source
    Add-TrustPart -Parts $Parts -Value $Item.domain
    Add-TrustPart -Parts $Parts -Value $Item.url
    Add-TrustPart -Parts $Parts -Value $Item.snippet
  }

  return ($Parts.ToArray() -join "`n")
}

function Get-TrustSurface {
  param($Response)

  $StructuredEvidence = Get-StructuredEvidenceText -Response $Response

  if ($StructuredEvidence.Trim().Length -gt 0) {
    return [pscustomobject]@{
      Text = $StructuredEvidence
      Mode = "structured_evidence"
    }
  }

  return [pscustomobject]@{
    Text = Get-AnswerText -Response $Response
    Mode = "answer_fallback"
  }
}

$Rows = @()

foreach ($Case in $Cases) {
  $Body = @{
    user_query = $Case.Query
  } | ConvertTo-Json -Depth 8

  try {
    $Response = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $Body -TimeoutSec 45
    $AnswerText = Get-AnswerText -Response $Response
    $TrustSurface = Get-TrustSurface -Response $Response

    $RequiredSurface = "$AnswerText`n$($TrustSurface.Text)"
    $TrustText = ([string]$TrustSurface.Text).ToLowerInvariant()

    $HasRequired = Test-AnyMatch -Text $RequiredSurface -Needles $Case.RequiredAny
    $HasHighTrust = Test-AnyMatch -Text $TrustText -Needles $HighTrustIndicators
    $HasWatchlist = Test-AnyMatch -Text $TrustText -Needles $WatchlistIndicators

    $TrustStatus =
      if ($HasHighTrust -and -not $HasWatchlist) { "GREEN" }
      elseif ($HasHighTrust -and $HasWatchlist) { "YELLOW" }
      elseif ($HasWatchlist) { "YELLOW" }
      else { "UNKNOWN" }

    $PrimaryLine = (($AnswerText -split "`n") | Where-Object { $_.Trim().Length -gt 0 } | Select-Object -First 1)

    $Rows += [pscustomobject]@{
      Case = $Case.Name
      RequiredSignal = if ($HasRequired) { "GREEN" } else { "RED" }
      TrustStatus = $TrustStatus
      HighTrustSeen = [bool]$HasHighTrust
      WatchlistSeen = [bool]$HasWatchlist
      EvidenceMode = $TrustSurface.Mode
      PrimaryRead = $PrimaryLine
    }
  } catch {
    $Rows += [pscustomobject]@{
      Case = $Case.Name
      RequiredSignal = "RED"
      TrustStatus = "RED"
      HighTrustSeen = $false
      WatchlistSeen = $false
      EvidenceMode = "error"
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
$StructuredRows = @($Rows | Where-Object { $_.EvidenceMode -eq "structured_evidence" }).Count

Write-Host ""
Write-Host "SOURCE TRUST SUMMARY"
[pscustomobject]@{
  RedSignals = $RedSignals
  WatchlistRows = $WatchlistRows
  UnknownRows = $UnknownRows
  StructuredEvidenceRows = $StructuredRows
  Strict = [bool]$Strict
  Meaning = "This evidence-aware radar grades curated source_evidence/source_domains first, then falls back to answer text only when structured evidence is unavailable."
} | Format-List

if ($RedSignals -gt 0) {
  throw "Retrieval source trust radar failed required signal checks."
}

if ($Strict -and ($WatchlistRows -gt 0 -or $UnknownRows -gt 0)) {
  throw "Strict source trust failed: watchlist or unknown source trust detected."
}

Write-Host "GREEN: HX2 retrieval source trust radar passed."


