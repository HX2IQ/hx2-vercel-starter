$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 SOURCE EVIDENCE PUBLISHER ATTRIBUTION GUARD =="
Write-Host "Mode: static route response contract"
Write-Host "Secrets printed: false"

$RouteFile = ".\app\api\hx2\chat-master\route.ts"

if (-not (Test-Path $RouteFile)) {
  throw "Missing chat master route: $RouteFile"
}

$Content = Get-Content $RouteFile -Raw

$Markers = @(
  @{ Name = "publisher suffix parser"; Text = "function publisherSuffixFromTitle" },
  @{ Name = "generic source detector"; Text = "function isGenericEvidenceSource" },
  @{ Name = "source-first attribution"; Text = "if (cleanSource && !isGenericEvidenceSource(cleanSource))" },
  @{ Name = "title suffix attribution"; Text = "const suffixDomain = normalizedPublisherDomain(publisherSuffix);" },
  @{ Name = "full title fallback only"; Text = "normalizedPublisherDomain(title) ||" },
  @{ Name = "CoinDesk mapping preserved"; Text = "coindesk.com" },
  @{ Name = "Decrypt mapping preserved"; Text = "decrypt.co" },
  @{ Name = "Bitget mapping preserved"; Text = "bitget.com" },
  @{ Name = "DTCC mapping preserved"; Text = "dtcc.com" },
  @{ Name = "Ripple mapping preserved"; Text = "ripple.com" },
  @{ Name = "domain field uses helper"; Text = "const domain = sourceEvidenceDomain(item, url, source, title);" }
)

$Rows = foreach ($Marker in $Markers) {
  [pscustomobject]@{
    Marker = $Marker.Name
    Status = if ($Content.Contains($Marker.Text)) { "GREEN" } else { "RED" }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

Write-Host ""
Write-Host "SOURCE EVIDENCE PUBLISHER ATTRIBUTION SUMMARY"
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "Confirms source evidence domain attribution prioritizes explicit publisher/source over topic words in article titles."
} | Format-List

if ($Red -gt 0) {
  throw "HX2 source evidence publisher attribution guard failed."
}

Write-Host "GREEN: HX2 source evidence publisher attribution guard passed."

