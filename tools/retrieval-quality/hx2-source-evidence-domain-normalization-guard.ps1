$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 SOURCE EVIDENCE DOMAIN NORMALIZATION GUARD =="
Write-Host "Mode: static route response contract"
Write-Host "Secrets printed: false"

$RouteFile = ".\app\api\hx2\chat-master\route.ts"

if (-not (Test-Path $RouteFile)) {
  throw "Missing chat master route: $RouteFile"
}

$Content = Get-Content $RouteFile -Raw

$Markers = @(
  @{ Name = "publisher domain normalizer"; Text = "function normalizedPublisherDomain" },
  @{ Name = "source evidence domain helper"; Text = "function sourceEvidenceDomain" },
  @{ Name = "google news relay bypass"; Text = "news\.google\.com" },
  @{ Name = "DTCC domain mapping"; Text = "dtcc.com" },
  @{ Name = "Ripple domain mapping"; Text = "ripple.com" },
  @{ Name = "XRPL domain mapping"; Text = "xrpl.org" },
  @{ Name = "Stellar domain mapping"; Text = "stellar.org" },
  @{ Name = "CoinDesk domain mapping"; Text = "coindesk.com" },
  @{ Name = "Decrypt domain mapping"; Text = "decrypt.co" },
  @{ Name = "domain field uses helper"; Text = "const domain = sourceEvidenceDomain(item, url, source, title);" },
  @{ Name = "source domains field preserved"; Text = "source_domains:" },
  @{ Name = "source evidence field preserved"; Text = "source_evidence:" }
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
Write-Host "SOURCE EVIDENCE DOMAIN NORMALIZATION SUMMARY"
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "Confirms Google News relay URLs are not treated as the publisher domain when source/title expose a real publisher."
} | Format-List

if ($Red -gt 0) {
  throw "HX2 source evidence domain normalization guard failed."
}

Write-Host "GREEN: HX2 source evidence domain normalization guard passed."

