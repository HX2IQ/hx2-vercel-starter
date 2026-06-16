param(
  [string]$Base = "https://optinodeiq.com"
)

$ErrorActionPreference = "Stop"

Write-Host "`n== HX2 RETRIEVAL QUALITY SMOKE =="
Write-Host "Base: $Base"

$Checks = @(
  @{
    q = "latest XRP news"
    primaryMust = "Ripple invests in Flutterwave"
    primaryBlock = "Institutional DeFi on XRPL"
    fullBlock = "Cam Skattebo"
  },
  @{
    q = "what is DTCC"
    primaryMust = "Depository Trust"
    primaryBlock = ""
    fullBlock = ""
  },
  @{
    q = "current XLM DTCC update"
    primaryMust = "DTCC picked Stellar"
    primaryBlock = "Cam Skattebo"
    fullBlock = "Cam Skattebo"
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

  if ($PrimaryLine -notmatch [regex]::Escape($Check.primaryMust)) {
    throw "Smoke failed for '$($Check.q)': primary missing '$($Check.primaryMust)'. Got: $PrimaryLine"
  }

  if ($Check.primaryBlock -and $PrimaryLine -match [regex]::Escape($Check.primaryBlock)) {
    throw "Smoke failed for '$($Check.q)': blocked primary text appeared '$($Check.primaryBlock)'. Got: $PrimaryLine"
  }

  if ($Check.fullBlock -and $Answer -match [regex]::Escape($Check.fullBlock)) {
    throw "Smoke failed for '$($Check.q)': blocked full-answer text appeared '$($Check.fullBlock)'"
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
