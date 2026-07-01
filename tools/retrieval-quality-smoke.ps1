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

Write-Host "`n== HX2 RETRIEVAL QUALITY SMOKE =="
Write-Host "Base: $Base"

$Checks = @(
  @{
    q = "latest XRP news"
    primaryAny = @("Ripple", "XRP", "XRPL")
    primaryAll = @()
    primaryBlock = @("Cam Skattebo", "Mshale")
    primarySoftBlock = @("Institutional DeFi on XRPL")
    fullBlock = @("Cam Skattebo", "Mshale")
  },
  @{
    q = "what is DTCC"
    primaryAny = @("Depository Trust", "DTCC")
    primaryAll = @()
    primaryBlock = @()
    primarySoftBlock = @()
    fullBlock = @()
  },
  @{
    q = "current XLM DTCC update"
    primaryAny = @("Stellar", "XLM", "DTCC", "DTC")
    primaryAll = @()
    primaryBlock = @("Cam Skattebo", "Mshale")
    primarySoftBlock = @()
    fullBlock = @("Cam Skattebo", "Mshale")
  }
)

foreach ($Check in $Checks) {
  $Body = @{
    message = $Check.q
  } | ConvertTo-Json -Depth 5

  $Res = Invoke-RestMethod `
    -Method Post `
    -Uri "$Base/api/hx2/chat-master" `
    -ContentType "application/json" `
    -Body $Body

  if (-not $Res.ok) {
    throw "Smoke failed for '$($Check.q)': endpoint returned ok=false"
  }

  $Answer = [string]$Res.answer
  $PrimaryLine = ($Answer -split "`n")[0]

  if ($Check.primaryAny.Count -gt 0 -and -not (Test-AnyMatch -Text $PrimaryLine -Needles $Check.primaryAny)) {
    throw "Smoke failed for '$($Check.q)': primary did not match any expected live-news terms. Got: $PrimaryLine"
  }

  if ($Check.primaryAll.Count -gt 0 -and -not (Test-AllMatch -Text $PrimaryLine -Needles $Check.primaryAll)) {
    throw "Smoke failed for '$($Check.q)': primary missing one or more required terms. Got: $PrimaryLine"
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
      throw "Smoke failed for '$($Check.q)': blocked primary text appeared '$Blocked'. Got: $PrimaryLine"
    }
  }

  if ($Check.ContainsKey("primarySoftBlock")) {
    foreach ($Blocked in $Check.primarySoftBlock) {
      if ($Blocked -and $PrimaryLine -match [regex]::Escape($Blocked)) {
        if (Test-AnyMatch -Text $SourceDomainsText -Needles $TrustedEvidenceDomains) {
          Write-Host "YELLOW: $($Check.q) -> soft-blocked primary text appeared with trusted structured evidence: $Blocked" -ForegroundColor Yellow
        } else {
          throw "Smoke failed for '$($Check.q)': soft-blocked primary text appeared without trusted structured evidence '$Blocked'. Got: $PrimaryLine"
        }
      }
    }
  }

  foreach ($Blocked in $Check.fullBlock) {
    if ($Blocked -and $Answer -match [regex]::Escape($Blocked)) {
      throw "Smoke failed for '$($Check.q)': blocked full-answer text appeared '$Blocked'"
    }
  }

  if ($Answer -notmatch "Confidence:") {
    throw "Smoke failed for '$($Check.q)': missing Confidence line"
  }

  if ($Answer -notmatch "Optimized by") {
    throw "Smoke failed for '$($Check.q)': missing Optimized by footer"
  }

  Write-Host "GREEN: $($Check.q) -> $PrimaryLine"
}

Write-Host "`nALL GREEN: retrieval quality smoke passed"

