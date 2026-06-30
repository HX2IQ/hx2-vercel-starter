$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 SOURCE EVIDENCE CONTRACT GUARD =="
Write-Host "Mode: static route response contract"
Write-Host "Secrets printed: false"

$RouteFile = ".\app\api\hx2\chat-master\route.ts"

if (-not (Test-Path $RouteFile)) {
  throw "Missing chat master route: $RouteFile"
}

$Content = Get-Content $RouteFile -Raw

$Markers = @(
  @{ Name = "source evidence helper"; Pattern = "function buildSourceEvidenceContract" },
  @{ Name = "source evidence field"; Pattern = "source_evidence:" },
  @{ Name = "source titles field"; Pattern = "source_titles:" },
  @{ Name = "source domains field"; Pattern = "source_domains:" },
  @{ Name = "source urls field"; Pattern = "source_urls:" },
  @{ Name = "retrieval summary field"; Pattern = "retrieval_summary:" },
  @{ Name = "answer wording preserved"; Pattern = "answer," },
  @{ Name = "reply mirror preserved"; Pattern = "reply: answer" },
  @{ Name = "message mirror preserved"; Pattern = "message: answer" },
  @{ Name = "content mirror preserved"; Pattern = "content: answer" },
  @{ Name = "text mirror preserved"; Pattern = "text: answer" }
)

$Rows = foreach ($Marker in $Markers) {
  [pscustomobject]@{
    Marker = $Marker.Name
    Status = if ($Content -match [regex]::Escape($Marker.Pattern)) { "GREEN" } else { "RED" }
  }
}

$Rows | Format-Table -AutoSize

$Red = @($Rows | Where-Object { $_.Status -eq "RED" }).Count

Write-Host ""
Write-Host "SOURCE EVIDENCE CONTRACT SUMMARY"
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "Confirms chat-master exposes structured source evidence while preserving visible answer fields."
} | Format-List

if ($Red -gt 0) {
  throw "HX2 source evidence contract guard failed."
}

Write-Host "GREEN: HX2 source evidence contract guard passed."

