$ErrorActionPreference = "Stop"

$Base = if ($env:HX2_BASE_URL) { $env:HX2_BASE_URL } else { "https://optinodeiq.com" }
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Write-Host ""
Write-Host "== HX2 Capability Planner Smoke ==" -ForegroundColor Cyan

$Cases = @(
  @{ Name="AH3"; Query="I take NAC, magnesium, and creatine while fasting and felt dizzy."; Mode="ah3" },
  @{ Name="Coding"; Query="Build me a landing page for HealthOI."; Mode="coding" },
  @{ Name="Research"; Query="Search current news about AI regulation."; Mode="research" },
  @{ Name="Business"; Query="Find me local warehouse options in Fort Myers for Koenig Polish."; Mode="business" },
  @{ Name="Image"; Query="Create an image ad for HealthOI."; Mode="image" },
  @{ Name="Conversation"; Query="What is the smartest move for my future?"; Mode="conversation" }
)

foreach ($Case in $Cases) {
  Write-Host ""
  Write-Host "Testing: $($Case.Name)" -ForegroundColor Yellow

  $Body = @{ user_query = $Case.Query } | ConvertTo-Json -Depth 10

  $res = Invoke-RestMethod `
    -Uri "$Base/api/hx2/chat-master?ts=$ts" `
    -Method POST `
    -ContentType "application/json" `
    -Body $Body

  $actual = [string]$res.capability_decision.mode

  if ($actual -ne $Case.Mode) {
    throw "$($Case.Name) failed: expected mode [$($Case.Mode)] but got [$actual]"
  }

  Write-Host "PASS: $($Case.Name) => $actual" -ForegroundColor Green
}

Write-Host ""
Write-Host "HX2 Capability Planner Smoke Passed." -ForegroundColor Green
