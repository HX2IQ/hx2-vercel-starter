param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

function Test-AnyMatch {
  param(
    [string]$Text,
    [string[]]$Needles
  )

  foreach ($Needle in $Needles) {
    if ($Needle -and $Text -match [regex]::Escape($Needle)) {
      return $true
    }
  }

  return $false
}

function Test-AllMatch {
  param(
    [string]$Text,
    [string[]]$Needles
  )

  foreach ($Needle in $Needles) {
    if ($Needle -and $Text -notmatch [regex]::Escape($Needle)) {
      return $false
    }
  }

  return $true
}

function Invoke-Hx2SmokeQuery {
  param(
    [string]$Base,
    [string]$Query
  )

  $Body = @{
    message = $Query
  } | ConvertTo-Json -Depth 5

  return Invoke-RestMethod `
    -Method Post `
    -Uri "$Base/api/hx2/chat-master" `
    -ContentType "application/json" `
    -Body $Body
}

function Test-Hx2SmokeResult {
  param(
    [hashtable]$Check,
    [object]$Res,
    [string]$AttemptQuery,
    [bool]$IsFallback
  )

  if (-not $Res.ok) {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = ""
      Reason = "endpoint returned ok=false"
    }
  }

  $Answer = [string]$Res.answer
  $PrimaryLine = ($Answer -split "`n")[0]

  if ($Check.primaryAny.Count -gt 0 -and -not (Test-AnyMatch -Text $PrimaryLine -Needles $Check.primaryAny)) {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = $PrimaryLine
      Reason = "primary did not match any expected live-news terms"
    }
  }

  if ($Check.primaryAll.Count -gt 0 -and -not (Test-AllMatch -Text $PrimaryLine -Needles $Check.primaryAll)) {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = $PrimaryLine
      Reason = "primary missing one or more required terms"
    }
  }
  if ($Check.ContainsKey("requiredAssetAny") -and $Check.requiredAssetAny.Count -gt 0 -and -not (Test-AnyMatch -Text $PrimaryLine -Needles $Check.requiredAssetAny)) {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = $PrimaryLine
      Reason = "primary missing required asset terms"
    }
  }

  if ($Check.ContainsKey("requiredContextAny") -and $Check.requiredContextAny.Count -gt 0 -and -not (Test-AnyMatch -Text $PrimaryLine -Needles $Check.requiredContextAny)) {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = $PrimaryLine
      Reason = "primary missing required context terms"
    }
  }

  $SourceDomainsText = ""
  if ($Res.PSObject.Properties.Name -contains "source_domains") {
    $SourceDomainsText = ((@($Res.source_domains) | ForEach-Object { [string]$_ }) -join "`n").ToLowerInvariant()
  }

  $TrustedEvidenceDomains = @(
    "ripple.com",
    "xrpl.org",
    "coindesk.com",
    "decrypt.co",
    "dtcc.com",
    "stellar.org"
  )

  foreach ($Blocked in $Check.primaryBlock) {
    if ($Blocked -and $PrimaryLine -match [regex]::Escape($Blocked)) {
      return [pscustomobject]@{
        Passed = $false
        PrimaryLine = $PrimaryLine
        Reason = "blocked primary text appeared '$Blocked'"
      }
    }
  }

  if ($Check.ContainsKey("primarySoftBlock")) {
    foreach ($Blocked in $Check.primarySoftBlock) {
      if ($Blocked -and $PrimaryLine -match [regex]::Escape($Blocked)) {
        if (Test-AnyMatch -Text $SourceDomainsText -Needles $TrustedEvidenceDomains) {
          Write-Host "YELLOW: $($Check.q) -> soft-blocked primary text appeared with trusted structured evidence: $Blocked" -ForegroundColor Yellow
        } else {
          return [pscustomobject]@{
            Passed = $false
            PrimaryLine = $PrimaryLine
            Reason = "soft-blocked primary text appeared without trusted structured evidence '$Blocked'"
          }
        }
      }
    }
  }

  foreach ($Blocked in $Check.fullBlock) {
    if ($Blocked -and $Answer -match [regex]::Escape($Blocked)) {
      return [pscustomobject]@{
        Passed = $false
        PrimaryLine = $PrimaryLine
        Reason = "blocked full-answer text appeared '$Blocked'"
      }
    }
  }

  if ($Answer -notmatch "Confidence:") {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = $PrimaryLine
      Reason = "missing Confidence line"
    }
  }

  if ($Answer -notmatch "Optimized by") {
    return [pscustomobject]@{
      Passed = $false
      PrimaryLine = $PrimaryLine
      Reason = "missing Optimized by footer"
    }
  }

  return [pscustomobject]@{
    Passed = $true
    PrimaryLine = $PrimaryLine
    Reason = if ($IsFallback) { "passed fallback query: $AttemptQuery" } else { "passed primary query" }
  }
}

Write-Host "`n== HX2 RETRIEVAL QUALITY SMOKE =="
Write-Host "Base: $Base"
Write-Host "Mode: relevance retry with strict failure after fallback"

$Checks = @(
  @{
    q = "latest XRP news"
    fallbackQueries = @("latest Ripple XRP XRPL news today")
    primaryAny = @("Ripple", "XRP", "XRPL")
    primaryAll = @()
    primaryBlock = @("Cam Skattebo", "Mshale")
    primarySoftBlock = @("Institutional DeFi on XRPL")
    fullBlock = @("Cam Skattebo", "Mshale")
  },
  @{
    q = "what is DTCC"
    fallbackQueries = @("what is Depository Trust Clearing Corporation DTCC")
    primaryAny = @("Depository Trust", "DTCC")
    primaryAll = @()
    primaryBlock = @()
    primarySoftBlock = @()
    fullBlock = @()
  },
  @{
    q = "current XLM DTCC update"
    fallbackQueries = @(
      "Stellar DTCC tokenization XLM update",
      "XLM Stellar DTCC DTC tokenization update",
      "Stellar DTC DTCC crypto tokenization update"
    )
    primaryAny = @()
    requiredAssetAny = @("Stellar", "XLM")
    requiredContextAny = @("DTCC", "DTC", "tokenization", "tokenized")
    primaryAll = @()
    primaryBlock = @("Cam Skattebo", "Mshale")
    primarySoftBlock = @()
    fullBlock = @("Cam Skattebo", "Mshale")
  }
)

foreach ($Check in $Checks) {
  $AttemptQueries = @($Check.q) + @($Check.fallbackQueries)
  $Failures = @()
  $Passed = $false

  for ($AttemptIndex = 0; $AttemptIndex -lt $AttemptQueries.Count; $AttemptIndex++) {
    $AttemptQuery = [string]$AttemptQueries[$AttemptIndex]
    $IsFallback = $AttemptIndex -gt 0

    $Res = Invoke-Hx2SmokeQuery -Base $Base -Query $AttemptQuery
    $Result = Test-Hx2SmokeResult -Check $Check -Res $Res -AttemptQuery $AttemptQuery -IsFallback $IsFallback

    if ($Result.Passed) {
      if ($IsFallback) {
        Write-Host "YELLOW: $($Check.q) primary failed, fallback passed using '$AttemptQuery'" -ForegroundColor Yellow
      }

      Write-Host "GREEN: $($Check.q) -> $($Result.PrimaryLine)"
      $Passed = $true
      break
    }

    $Failures += [pscustomobject]@{
      Query = $AttemptQuery
      Reason = $Result.Reason
      PrimaryLine = $Result.PrimaryLine
    }
  }

  if (-not $Passed) {
    Write-Host ""
    Write-Host "FAILED ATTEMPTS FOR: $($Check.q)" -ForegroundColor Red
    $Failures | Format-Table -AutoSize

    $LastFailure = $Failures[-1]
    throw "Smoke failed for '$($Check.q)': $($LastFailure.Reason). Got: $($LastFailure.PrimaryLine)"
  }
}

Write-Host "`nALL GREEN: retrieval quality smoke passed"


