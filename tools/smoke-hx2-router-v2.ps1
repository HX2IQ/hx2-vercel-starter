$ErrorActionPreference = "Stop"

$Base = if ($env:HX2_BASE_URL) { $env:HX2_BASE_URL } else { "https://optinodeiq.com" }
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Write-Host ""
Write-Host "== HX2 Router v2 Smoke ==" -ForegroundColor Cyan

$Cases = @(
  @{
    Name = "AH3 health"
    Query = "I take NAC, magnesium, and creatine while fasting and felt dizzy."
    RouterNode = "ah3"
    DisplayNode = "ah3"
    Mode = "ah3"
  },
  @{
    Name = "O2 advisory"
    Query = "What is the smartest move for my future?"
    RouterNode = "o2"
    DisplayNode = "o2"
    Mode = "conversation"
  },
  @{
    Name = "DEV2 coding"
    Query = "Build me a landing page for HealthOI."
    RouterNode = "dev2"
    DisplayNode = "dev2"
    Mode = "coding"
  },
  @{
    Name = "Research"
    Query = "Search current news about AI regulation."
    RouterNode = "research"
    DisplayNode = "research"
    Mode = "research"
  },
  @{
    Name = "Business"
    Query = "Find me local warehouse options in Fort Myers for Koenig Polish."
    RouterNode = "business"
    DisplayNode = "business"
    Mode = "business"
  },
  @{
    Name = "Design"
    Query = "Create an image ad for HealthOI."
    RouterNode = "design"
    DisplayNode = "design"
    Mode = "image"
  }
)

foreach ($Case in $Cases) {
  Write-Host ""
  Write-Host "Testing: $($Case.Name)" -ForegroundColor Yellow

  $Body = @{
    user_query = $Case.Query
  } | ConvertTo-Json -Depth 10

  $res = Invoke-RestMethod `
    -Uri "$Base/api/hx2/chat-master?ts=$ts" `
    -Method POST `
    -ContentType "application/json" `
    -Body $Body

  if ($res.capability_decision.mode -ne $Case.Mode) {
    throw "$($Case.Name): expected mode $($Case.Mode), got $($res.capability_decision.mode)"
  }

  if ($res.router.node_id -ne $Case.RouterNode) {
    throw "$($Case.Name): expected router.node_id $($Case.RouterNode), got $($res.router.node_id)"
  }

  if ($res.display_node.node_id -ne $Case.DisplayNode) {
    throw "$($Case.Name): expected display_node.node_id $($Case.DisplayNode), got $($res.display_node.node_id)"
  }

  Write-Host "PASS: $($Case.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "HX2 Router v2 Smoke Passed." -ForegroundColor Green


Write-Host ""
Write-Host "== smoke: HealthOI false AH3 regression ==" -ForegroundColor Cyan

$Body = @{
  user_query = "Build me a landing page for HealthOI."
} | ConvertTo-Json -Depth 10

$res = Invoke-RestMethod `
  -Uri "$Base/api/hx2/chat-master?ts=$ts" `
  -Method POST `
  -ContentType "application/json" `
  -Body $Body

if ($res.capability_decision.mode -ne "coding") {
  throw "HealthOI regression failed: expected coding mode"
}

if ($res.display_node.node_id -ne "dev2") {
  throw "HealthOI regression failed: expected display_node dev2"
}

if ($res.router.node_id -eq "ah3") {
  throw "HealthOI regression failed: router incorrectly selected AH3"
}

Write-Host "OK: HealthOI does not falsely route to AH3" -ForegroundColor Green


Write-Host ""
Write-Host "== smoke: HealthOI false AH3 regression ==" -ForegroundColor Cyan

$Body = @{
  user_query = "Build me a landing page for HealthOI."
} | ConvertTo-Json -Depth 10

$res = Invoke-RestMethod `
  -Uri "$Base/api/hx2/chat-master?ts=$ts" `
  -Method POST `
  -ContentType "application/json" `
  -Body $Body

if ($res.capability_decision.mode -ne "coding") {
  throw "HealthOI regression failed: expected coding mode"
}

if ($res.display_node.node_id -ne "dev2") {
  throw "HealthOI regression failed: expected display_node dev2"
}

if ($res.router.node_id -eq "ah3") {
  throw "HealthOI regression failed: router incorrectly selected AH3"
}

Write-Host "OK: HealthOI does not falsely route to AH3" -ForegroundColor Green



