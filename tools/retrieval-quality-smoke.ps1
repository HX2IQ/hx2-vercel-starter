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
    primaryBlock = @("Institutional DeFi on XRPL", "Cam Skattebo", "Mshale")
    fullBlock = @("Cam Skattebo", "Mshale")
  },
  @{
    q = "what is DTCC"
    primaryAny = @("Depository Trust", "DTCC")
    primaryAll = @()
    primaryBlock = @()
    fullBlock = @()
  },
  @{
    q = "current XLM DTCC update"
    primaryAny = @("Stellar", "XLM", "DTCC", "DTC")
    primaryAll = @()
    primaryBlock = @("Cam Skattebo", "Mshale")
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

  foreach ($Blocked in $Check.primaryBlock) {
    if ($Blocked -and $PrimaryLine -match [regex]::Escape($Blocked)) {
      throw "Smoke failed for '$($Check.q)': blocked primary text appeared '$Blocked'. Got: $PrimaryLine"
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
