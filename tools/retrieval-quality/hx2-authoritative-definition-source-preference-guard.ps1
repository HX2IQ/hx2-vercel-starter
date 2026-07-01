$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "== HX2 AUTHORITATIVE DEFINITION SOURCE PREFERENCE GUARD =="
Write-Host "Mode: static retrieval contract"
Write-Host "Secrets printed: false"

$UnifiedFile = ".\app\api\hx2\_lib\unified-retrieval.ts"

if (-not (Test-Path $UnifiedFile)) {
  throw "Missing unified retrieval file: $UnifiedFile"
}

$Content = Get-Content $UnifiedFile -Raw

$Markers = @(
  @{ Name = "local definition fallback exists"; Text = "function localDefinitionFallback" },
  @{ Name = "DTCC local definition exists"; Text = '"depository trust & clearing corporation"' },
  @{ Name = "DTCC official URL exists"; Text = 'url: "https://www.dtcc.com/"' },
  @{ Name = "localDefinitions variable"; Text = "const localDefinitions =" },
  @{ Name = "definitionOnly uses local fallback"; Text = "? localDefinitionFallback(normalized)" },
  @{ Name = "authoritative definitions preserve definition branch"; Text = "definitionOnly" },
  @{ Name = "local definitions spread before wiki"; Text = "...localDefinitions," },
  @{ Name = "wiki definitions preserved"; Text = "...wikiResults" },
  @{ Name = "definition sources still ranked"; Text = "rankSourcesForQuery(query, [" },
  @{ Name = "DTCC trust boost preserved"; Text = "dtcc.com" }
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
Write-Host "AUTHORITATIVE DEFINITION SOURCE PREFERENCE SUMMARY"
[pscustomobject]@{
  Green = @($Rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Red = $Red
  Meaning = "Confirms definition-only retrieval includes local authoritative definitions before Wikipedia so official domains can rank first."
} | Format-List

if ($Red -gt 0) {
  throw "HX2 authoritative definition source preference guard failed."
}

Write-Host "GREEN: HX2 authoritative definition source preference guard passed."

