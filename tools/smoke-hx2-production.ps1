$ErrorActionPreference = "Stop"

$Base = if ($env:HX2_BASE_URL) { $env:HX2_BASE_URL } else { "https://optinodeiq.com" }
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

function Test-Hx2Contract {
  param(
    [string]$Name,
    [string]$Query,
    [string]$ExpectedMode,
    [string]$ExpectedDisplayNode,
    [switch]$RequireSources,
    [int]$MinimumAnswerLength = 100
  )

  Write-Host ""
  Write-Host "== smoke: $Name ==" -ForegroundColor Cyan

  $Body = @{ user_query = $Query } | ConvertTo-Json -Depth 10

  $res = Invoke-RestMethod `
    -Uri "$Base/api/hx2/chat-master?ts=$ts" `
    -Method POST `
    -ContentType "application/json" `
    -Body $Body

  if ($res.ok -ne $true) {
    throw "$Name failed: ok=false"
  }

  if ($ExpectedMode -and $res.capability_decision.mode -ne $ExpectedMode) {
    throw "$Name failed: expected mode=$ExpectedMode got=$($res.capability_decision.mode)"
  }

  if ($ExpectedDisplayNode -and $res.display_node.node_id -ne $ExpectedDisplayNode) {
    throw "$Name failed: expected display_node=$ExpectedDisplayNode got=$($res.display_node.node_id)"
  }

  $answer = [string]$res.answer
  if ($answer.Length -lt $MinimumAnswerLength) {
    throw "$Name failed: answer too short length=$($answer.Length)"
  }

  if ($RequireSources -and $null -eq $res.sources) {
    throw "$Name failed: expected sources but sources=null"
  }

  Write-Host "OK: $Name" -ForegroundColor Green
}

Test-Hx2Contract -Name "AH2 fasting synthesis" -Query "I take NAC, magnesium, and creatine while fasting and felt dizzy." -ExpectedMode "ah3" -ExpectedDisplayNode "ah3" -MinimumAnswerLength 200
Test-Hx2Contract -Name "source-enabled magnesium search" -Query "Search current news about magnesium supplementation and fasting dizziness." -ExpectedMode "research" -ExpectedDisplayNode "research" -RequireSources -MinimumAnswerLength 150
Test-Hx2Contract -Name "Coding capability synthesis" -Query "Build me a landing page for HealthOI." -ExpectedMode "coding" -ExpectedDisplayNode "dev2" -MinimumAnswerLength 50
Test-Hx2Contract -Name "Research capability synthesis" -Query "Search current news about AI regulation." -ExpectedMode "research" -ExpectedDisplayNode "research" -RequireSources -MinimumAnswerLength 150
Test-Hx2Contract -Name "Business capability synthesis" -Query "Find me local warehouse options in Fort Myers for Koenig Polish." -ExpectedMode "business" -ExpectedDisplayNode "business" -MinimumAnswerLength 50
Test-Hx2Contract -Name "Image capability synthesis" -Query "Create an image ad for HealthOI." -ExpectedMode "image" -ExpectedDisplayNode "design" -MinimumAnswerLength 50
Test-Hx2Contract -Name "Owner context advisory synthesis" -Query "What is the smartest move for my future?" -ExpectedMode "conversation" -ExpectedDisplayNode "o2" -MinimumAnswerLength 50

Write-Host ""
Write-Host "HX2 contract-only smoke passed." -ForegroundColor Green

